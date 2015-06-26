'use strict';

//Setting up route
angular.module('admins').config(['$stateProvider',
	function ($stateProvider) {
		// Projects state routing
		$stateProvider.
			state('admin', {
				url: '/admin',
				templateUrl: 'modules/admins/views/admins.client.view.html',
				//data property is inherited by child states, so you can place something like this authenticate flag in the parent.
				data: {
					authenticate: true
				}
			})
			//admin projects routes
			.state('adminProjectsQueue', {
				url: '/admin/projects-queue',
				templateUrl: 'modules/admins/views/projects/admin-projects-list.client.view.html'
			})
			.state('adminEditProject', {
				url: '/admin/edit-project/:projectId',
				templateUrl: 'modules/admins/views/projects/admin-view-project.client.view.html'
			})

			//admin contact form routes
			.state('adminListMessages', {
				url: '/admin/messages',
				templateUrl: 'modules/admins/views/messages/admin-list-messages.client.view.html'
			})
			.state('adminViewMessage', {
				url: '/admin/messages/:contactId',
				templateUrl: 'modules/admins/views/messages/admin-view-message.client.view.html'
			})

			//admin user routes
			.state('adminListUsers', {
				url: '/admin/list-users',
				templateUrl: 'modules/admins/views/users/admin-list-users.client.view.html'
			})
			.state('adminViewUser', {
				url: '/users/:userId',
				templateUrl: 'modules/admins/views/users/admin-view-user.client.view.html'
			}).
			state('adminEditUser', {
				url: '/users/:userId/edit',
				templateUrl: 'modules/admins/views/users/admin-edit-user.client.view.html'
			})
			.state('createUser', {
				url: '/admin/create-user',
				templateUrl: 'modules/users/views/create-user.client.view.html'
			})
			.state('adminDashboard', {
				url: '/admin/dashboard',
				templateUrl: 'modules/admins/views/dashboard/admin-dashboard.client.view.html'
			});
	}

]);