// services.js

(function() {
  'use strict';

  angular.module('app')

  // Get current location.
  .factory('$geolocation', function($q) {
    this.get = function() {
      var deferred = $q.defer();
 
      // Call Geolocation API.
      navigator.geolocation.getCurrentPosition(
        function(result) {
          // Call successful.
          deferred.resolve(result);
        },
        function(error) {
          // Something went wrong.
          deferred.reject(error);
        }
      );

      // Return a promise.
      return deferred.promise;          
    };

    return this;
  })

  // Service to communicate with OpenWeatherMap API.
  .factory('$weather', function($q, $http) {
    var API_ROOT = 'http://api.openweathermap.org/data/2.5/';

    this.byCityName = function(query) {
      var deferred = $q.defer();

      // Call the API using JSONP.
      $http.jsonp(API_ROOT + '/weather?callback=JSON_CALLBACK&q=' + encodeURI(query)).then(
        function(response) {
          var statusCode = parseInt(response.data.cod);

          if (statusCode === 200) {
            // Call successful.
            deferred.resolve(response.data);
          }
          else {
            // Something went wrong. Probably the city doesn't exist.
            deferred.reject(response.data.message);
          }
        },
        function(error) {
          // Unable to connect to API.
          deferred.reject(error);
        }
      );  
      // Return a promise.
      return deferred.promise;
    }; 

    this.byCityId = function(id) {
      var deferred = $q.defer();

      $http.jsonp(API_ROOT + '/weather?callback=JSON_CALLBACK&id=' + id).then(
        function(response) {
          var statusCode = parseInt(response.data.cod);

          if (statusCode === 200) {
            deferred.resolve(response.data);
          }
          else {
            deferred.reject(response.data.message);
          }
        },
        function(error) {
          deferred.reject(error); 
        }
      );
      return deferred.promise;
    };

    this.byLocation = function(coords) {
      var deferred = $q.defer();

      $http.jsonp(API_ROOT + '/weather?callback=JSON_CALLBACK&lat=' + coords.latitude + '&lon=' + coords.longitude).then(
        function(response) {
          var statusCode = parseInt(response.data.cod);

          if (statusCode === 200) {
            deferred.resolve(response.data);
          }
          else {
            deferred.reject(response.data.message);
          }
        },
        function(error) {
          deferred.reject(error);
        }
      );
      return deferred.promise;
    };

    return this;
  });
})();
