'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'Upload', '$http',
  function ($scope, $timeout, $window, Authentication, Upload, $http) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;
    $scope.uploading = false;

    $scope.onFileSelect = function(files) {

      if (files.length > 0) {
        $scope.uploading = true;
        var filename = files[0].name;
        var type = files[0].type;
        var query = {
          user: $scope.user,
          filename: filename,
          type: type
        };
        var configObj = {cache: true};
        $http.post('api/v1/s3/upload', query, configObj)
          .success(function(result) {
            console.log('result v1\n', result);
            Upload.upload({
              url: result.url, //s3Url
              transformRequest: function(data, headersGetter) {
                var headers = headersGetter();
                delete headers.Authorization;
                console.log('data v1\n', data);
                return data;
              },
              fields: result.fields, //credentials
              method: 'POST',
              file: files[0]
            }).progress(function(evt) {

              console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total));

            }).success(function(data, status, headers, config) {

              // file is uploaded successfully
              $scope.uploading = false;

              console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);

              // need to set image on front end
              if(data && data.s3Url) {
                console.log('data v2\n', data);
                $scope.user.profileImageURL = data.s3Url;
                $scope.imageURL = data.s3Url;
              }
              console.log('$scope.imageURL:\n', $scope.imageURL);
                //$http({
                //  url: '',
                //  method: 'PUT'
                //})
                //  .then(function(data) {
                //
                //  })
                //  .finally(function(data) {
                //
                //  });

              // and need to update mongodb


            }).error(function() {

            });

            if(result && result.s3Url) {
              console.log('result v2\n', result);
              $scope.user.profileImageURL = result.s3Url;
              $scope.imageURL = result.s3Url;
            }
          })
          .error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.uploading = false;
          });

        //  .xhr(function(xhr) {
        //    $scope.abort = function() {
        //    xhr.abort();
        //    $scope.uploading = false;
        //  };
        //});

      }


    };


  }
]);
