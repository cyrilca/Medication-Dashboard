'use strict';

angular.module('medicationReminderApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ngAnimate',
  'pickadate',
  'ngAudio',
  'ngDialog'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, pickadateI18nProvider) {
    $urlRouterProvider
      .otherwise('/');

      pickadateI18nProvider.translations = {
            prev: '<i class="ion-ios-arrow-back"></i>',
            next: '<i class="ion-ios-arrow-forward"></i>'
      }

    $locationProvider.html5Mode(true);
  });
