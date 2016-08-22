angular
    .module('medicationReminderApp')
    .service('api', function($http) {

      this.getMedications = function(start, end) {
        console.log(`/api/medications?start=${start}&end=${end}`);
        return $http.get(`/api/medications?start=${start}&end=${end}`);
      };

      this.completeMedication = function(_id) {
        return $http.put(`/api/medications/${_id}`, {completed: true});
      };

  });
