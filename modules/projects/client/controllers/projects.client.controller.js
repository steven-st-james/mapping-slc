'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$http', '$sce', 'ApiKeys', 'GeoCodeApi', '$rootScope', 'AdminAuthService', 'User', 'AdminUpdateUser', '$state', 'UtilsService', '$uibModal', '$window', '$log',
  function ($scope, $stateParams, $location, Authentication, Projects, $http, $sce, ApiKeys, GeoCodeApi, $rootScope, AdminAuthService, User, AdminUpdateUser, $state, UtilsService, $uibModal, $window, $log) {
    $scope.user = Authentication.user;
    $scope.isAdmin = AdminAuthService;
    $scope.logo = '../../../modules/core/img/brand/mapping_150w.png';
    var width = '800';
    var height = '250';
    var markerUrl = 'url-http%3A%2F%2Fwww.mappingslc.org%2Fimages%2Fsite_img%2Flogo_marker_150px.png';
    $scope.mapImage = '';
    $rootScope.signInBeforeProject = false;
    $scope.updateToContrib = null;
    $scope.isPublished = false;
    $scope.userToEdit = {};
    $scope.images = [];

    $scope.trustAsHtml = $sce.trustAsHtml;

    console.log('$scope.user:\n', $scope.user);
    console.log('$scope.project:\n', $scope.project);

    $scope.init = function () {
      $scope.publishedProjects();
    };

    $scope.initSubmissionStatus = function () {
      $scope.findOne();
    };

    //provides logic for the css in the forms
    UtilsService.cssLayout();

    $scope.showUpload = false;
    $scope.showSubmit = false;
    $scope.showUploadFunction = function () {
      if (project.street !== '') {
        $scope.showUpload = true;
      }
      if ($scope.showUpload && this.project.story !== '') {
        $scope.showSubmit = true;
      }
    };

    /**
     * called when $scope.project.status updates
     */
    $scope.projectStatusChanged = function () {
      if ($scope.project.status === 'published') {
        $scope.publishProject();
        $scope.toggleEdit = false;
      } else {
        $scope.update();
        $scope.toggleEdit = false;
      }
    };

    $scope.confirmPublishModal = function () {
      $scope.animationsEnabled = true;
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: '/modules/projects/client/directives/views/project-warning-modal.html',
        controller: 'ModalController',
        size: 'lg'
      });
    };

    var publishUser = function (project) {
      AdminUpdateUser.get({userId: project.user._id},
        function (userData, getResponseHeader) {
          userData.associatedProjects.push(project._id);
          if (userData.roles[0] !== 'admin' || userData.roles[0] !== 'superUser') {
            userData.roles[0] = 'contributor';
          }
          userData.$update(function (userData, putResponseHeaders) {
          });
        });
    };

    $scope.publishProject = function () {
      //todo need to call on a confirm modal first
      $scope.confirmPublishModal();
      $scope.project.publishedDate = new Date();
      $scope.update();
      publishUser($scope.project); //call method to display contributor bio
    };

    var saveProject = null;
    $scope.updateLatLng = function (project) {
      console.log('project ctrl', project);
      $http.get('/api/v1/keys').success(function (data) {
        var mapboxKey = data.mapboxKey;
        var mapboxSecret = data.mapboxSecret;
        var hereKey = data.hereKey;
        var hereSecret = data.hereSecret;

        GeoCodeApi.callGeoCodeApi(project, hereKey, hereSecret, saveProject)
          .success(function (data) {
            project.lat = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
            project.lng = data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
            project.mapImage = 'http://api.tiles.mapbox.com/v4/' + mapboxKey + '/' + markerUrl + '(' + project.lng + ',' + project.lat + ')/' + project.lng + ',' + project.lat + ',15/' + width + 'x' + height + '.png?access_token=' + mapboxSecret;
            saveProject();
          })
          .error(function (data, status) {

          })
      });
    };

    // Find a list of all published projects
    //PublishingService.getPublishedProjects().
    $scope.publishedProjects = function () {
      $http.get('/api/v1/projects/published').
      success(function (publishedProjects) {
        $scope.publishedProjects = publishedProjects;
      }).
      error(function (data, status) {

      });
    };


    //$rootScope.previousState = '';
    //$rootScope.currentState = '';
    //$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from) {
    //  $rootScope.previousState = from.name;
    //  $rootScope.currentState = to.name;
    //});
    //$scope.goBack = function () {
    //  if ($rootScope.previousState === 'listProjects') {
    //    $state.go($rootScope.previousState);
    //  } else {
    //    $state.go('admin');
    //  }
    //};
    //$scope.run = function ($rootScope, $state, Authentication) {
    //  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //    if (toState.authenticate && !Authentication.isLoggedIn()) {
    //    }
    //    event.preventDefault();
    //  });
    //};
    //
    //$scope.userLoggedin = function () {
    //  // get request to /users/me
    //  if ($location.path() === '/projects/create') {
    //    $http.get('/api/v1/users/me')
    //      .success(function (data) {
    //        if (data === null) {
    //          $rootScope.signInBeforeProject = true;
    //          $location.path('/authentication/signin');
    //        }
    //      });
    //  }
    //}();

    // Create new Project
    $scope.create = function (isValid) {
      $scope.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'projectForm');
        return false;
      }

      // Create new Project object
      var project = new Projects({
        createdBy: Authentication.user._id,
        street: this.project.street,
        city: this.project.city,
        state: 'UT',
        zip: this.project.zip,
        story: '',
        title: this.project.title
      });

      saveProject = function () {
        project.$save(function (response) {
          console.log('location.path: ', 'projects/' + response._id + '/confirm');
          $location.path('projects/' + response._id + '/confirm');
          // Clear form fields
          $scope.street = '';
          $scope.city = '';
          $scope.state = '';
          $scope.zip = '';
          $scope.story = '';
          $scope.title = '';
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      };

      $scope.updateLatLng(project);

    };

    // Remove existing Project
    $scope.remove = function (project) {
      if (project) {
        project.$remove();

        for (var i in $scope.projects) {
          if ($scope.projects [i] === project) {
            $scope.projects.splice(i, 1);
          }
        }
      } else {
        $scope.project.$remove(function () {
          if ($location.path() === '/admin/edit-project/' + $scope.project._id) {
            $location.path('admin/projects-queue');
          } else {
            $location.path('projects');
          }
        });
      }
    };

    // Update existing Project
    $scope.update = function () {
      var project = $scope.project;
      project.$update(function () {
        if ($location.path() === '/admin/edit-project/' + project._id) {
          //return to view mode and call notify for success message
        } else {
          $location.path('projects/' + project._id);
        }
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    // Find a list of Projects
    $scope.find = function () {
      $scope.projects = Projects.query();
    };

    // Find existing Project
    $scope.findOne = function () {

      Projects.get({
        projectId: $stateParams.projectId
      }, function (project) {
        $scope.project = project;
        if (project.vimeoId) {
          $scope.vimeo = {
            video: $sce.trustAsResourceUrl('http://player.vimeo.com/video/' + project.vimeoId),
            width: $window.innerWidth / 1.75,
            height: $window.innerHeight / 1.75
          };
        }
        if (project.soundCloudId) {
          $scope.soundCloud = {
            audio: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + project.soundCloudId + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true',
            width: $window.innerWidth / 1.75,
            height: $window.innerHeight / 1.75
          };
        }
        if (project.imageGallery) {
          for (var i = 0; i < project.imageGallery.length; i++) {
            $scope.images.push(project.imageGallery[i]);
          }
        }
        console.log('$scope.project:\n', $scope.project);
      });
    };

    $scope.completed = function () {
      var formField;
      for (formField in $scope.createProject) {
        if ($scope.createProject === null) {
          return $scope.completed = false;
        } else {
          $scope.completed = true;
        }
      }
    };

    ////CKEDITOR.replace('story');
    //$scope.editorOptions = {
    //  language: 'en',
    //  uiColor: '#02211D'
    //};
    //CKEDITOR.replaceClass = 'ck-crazy';

    //modal for leaving projects
    //Give user warning if leaving form
    $scope.preventRunning = true;
    $scope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {

        if (!$scope.preventRunning) {
          return
        } else {
          event.preventDefault();

          var template = '';
          var items = [];
          $scope.items = [];

          $scope.animationsEnabled = true;
          $scope.openModal = function (size, backdropClass, windowClass) {

            var modalInstance = $uibModal.open({
              templateUrl: template,
              controller: 'ModalController',
              animation: $scope.animationsEnabled,
              backdrop: 'static',
              backdropClass: backdropClass,
              windowClass: windowClass,
              size: size,
              resolve: {
                items: function () {
                  return $scope.items;
                }
              }
            });

            modalInstance.result.then(function (selectedItem) {
              $scope.preventRunning = false;
              $state.go(toState.name);
            }, function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
            $scope.toggleAnimation = function () {
              $scope.animationsEnabled = !$scope.animationsEnabled;
            };
          };
          if (Authentication.user === '') {
            template = '/modules/projects/client/directives/views/project-warning-modal.html';
            $scope.openModal('lg');
          }
          if (fromState.url === '/projects/create' && toState.url !== '/projects/:projectId') {
            template = '/modules/projects/client/directives/views/project-warning-modal.html';
            $scope.openModal('lg');
          }
        }
      });


    ////admin panel editing
    //$scope.toggleEdit = false;
    //$scope.toggleId = 0;
    //
    //$scope.toggleEditFn = function (editNum) {
    //  $scope.toggleEdit = !$scope.toggle;
    //  $scope.toggleId = editNum;
    //};

    /**
     * nlp
     **/
    //$scope.nlpData = null;
    //var getNlpData = function() {
    //	$http.get('/nlp').
    //		success(function (nlpData) {
    //			console.log(nlpData);
    //			$scope.nlpData = nlpData;
    //		}).
    //		error(function () {
    //		});
    //};


  }
]);

