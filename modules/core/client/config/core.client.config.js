'use strict';

//Setting up route
angular.module('core').config(['$compileProvider',
  function ($compileProvider) {

    // when `false`, turns off debugging for prod
    // https://docs.angularjs.org/guide/production
    $compileProvider.debugInfoEnabled(false);
  }
]);
<<<<<<< HEAD
=======

  //.run(function($rootScope) {
  //  angular.element(document).on('click', function(e) {
  //    $rootScope.$broadcast('documentClicked', angular.element(e.target));
  //  });
  //
  //  // Collapsing the menu after navigation
  //  $scope.$on('$stateChangeSuccess', function () {
  //    $scope.isCollapsed = false;
  //  });
  //
  //});




>>>>>>> 2536f724a65c88f47abff3bf0831d533480a8ac6
