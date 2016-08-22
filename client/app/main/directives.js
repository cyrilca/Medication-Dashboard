angular
    .module('medicationReminderApp')
    .directive('missedList', function($animate) {
      return {
        restrict: 'E',
        scope: {
          item: '=',
          complete: '&completeItem'
        },
        replace: true,
        templateUrl: 'app/templates/missedItem.html'
      };
    })
    .directive('card', function() {
      return {
        restrict: 'E',
        scope: {
          item: '=',
          complete: '&completeItem'
        },
        replace: true,
        templateUrl: 'app/templates/card.html'
      }
    })
