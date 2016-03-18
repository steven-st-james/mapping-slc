'use strict';

// Contacts controller
angular.module('contacts').controller('ContactsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Contacts', '$http', 'AdminAuthService', 'UtilsService', 'notify',
  function ($scope, $stateParams, $location, Authentication, Contacts, $http, AdminAuthService, UtilsService, notify) {
    $scope.authentication = Authentication;
    $scope.isAdmin = AdminAuthService;

    //function to create a link on an entire row in a table
    $scope.viewMessage = function (contactId) {
      $location.path('admin/messages/' + contactId);
    };

    //provides logic for the css in the forms
    UtilsService.cssLayout();

    $scope.toggleSort = true;
    $scope.oneAtATime = true;

    // Create new Contact
    $scope.create = function () {
      // Create new Contact object
      var contact = new Contacts({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        zip: this.zip,
        newsletter: this.newsletter,
        message: this.message
      });

      // Redirect after save
      contact.$save(function (response) {
        $location.path('/');

        // Clear form fields
        $scope.firstName = '';
        $scope.lastName = '';
        $scope.email = '';
        $scope.zip = '';
        $scope.newsletter = '';
        $scope.message = '';
        console.log('response:\n', response);
        if (response.$resolved) {
          notify({
            message: 'Thanks for the message!',
            classes: 'ng-notify-contact-success'
          })
        } else {
          notify({
            message: 'Something went wrong, and we didn\'t receive your message We apologize.',
            classes: 'ng-notify-contact-failure'
          })
        }
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Contact
    $scope.remove = function (contact) {
      if (contact) {
        contact.$remove();

        for (var i in $scope.contacts) {
          if ($scope.contacts [i] === contact) {
            $scope.contacts.splice(i, 1);
          }
        }
      } else {
        $scope.contact.$remove(function () {
          $location.path('contacts');
        });
      }
    };

    // Update existing Contact
    $scope.update = function () {
      var contact = $scope.contact;

      contact.$update(function () {
        $location.path('contacts/' + contact._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Contacts
    $scope.find = function () {
      $scope.contacts = Contacts.query();
    };

    // Find existing Contact
    $scope.findOne = function () {
      $scope.contact = Contacts.get({
        contactId: $stateParams.contactId
      });
    };

    //get data from back end for display in table
    $http.get('/contacts').success(function (messageData) {
      //console.log(messageData);
      $scope.messageData = messageData;

      $scope.sentToday = function () {
        console.log('Date.now(messageData.created): ', Date.now(messageData.created));
        var today = Date.now(messageData.created);
        return today;
        //}
      };

    }).error(function (data, status) {

    });

  }
]);


