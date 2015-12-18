'use strict';

//Setting up route
angular.module('contacts').config(['$stateProvider',
    function ($stateProvider) {
        // Contacts state routing
        $stateProvider.
            state('createContact', {
                url: '/contact-us',
                templateUrl: 'modules/contacts/client/views/contact-us.client.view.html',
            })
            .state('editContact', {
                url: '/contacts/:contactId/edit',
                templateUrl: 'modules/contacts/client/views/edit-contact.client.view.html'
            })
            .state('aboutMappingSlc', {
                url: '/about-mapping-slc',
                templateUrl: 'modules/contacts/client/views/about-mapping-slc.client.view.html'
            })
            .state('aboutUs', {
              url: '/about-us',
              templateUrl: 'modules/contacts/client/views/about-us.client.view.html'
            });
    }
]);
