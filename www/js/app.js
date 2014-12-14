(function() {
  'use strict';

  angular.module('app', ['onsen'])

  .controller('WeatherController', function($scope, $geolocation) {
    $scope.getWeather = function() {

    };

    $scope.updateLocalWeather = function() {
      $geolocation.get().then(
        function(position) {
        }
      );
    };

    $scope.updateLocalWeather();
  })

  .factory('$geolocation', function($q) {
    return {
      get: function() {
        var deferred = $q.defer();

        navigator.geolocation.getCurrentPosition(
          function(result) {
            deferred.resolve(result);
          },
          function(error) {
            deferred.reject(error);
          }
        );

        return deferred.promise;          
      },

      watch: function() {
        var deferred = $q.defer();

        navigator.geolocation.watchPosition(
          function(result) {
            deferred.notify(result);
          },
          function(error) {
            deferred.reject(error);
          }
        );

        return deferred.promise;
      }
    };
  })

  .factory('$weather', function($q, $http) {
    this.search = function(query) {
      var deferred = $q.defer();
  
      $http.jsonp('http://api.openweathermap.org/data/2.5/weather?callback=JSON_CALLBACK&q=' + encodeURI(query)).then(
        function(response) {
          // Buggy API. Status code is sometimes a string and sometimes an integer.
          var statusCode = parseInt(response.data.cod);

          if (statusCode === 200) {
            deferred.resolve(response.data);
          }
          else {
            deferred.reject(response.data.message);
          }
        },
        function(error) {
          console.log(error);
        }
      );  

      return deferred.promise;
    }; 

    return this;
  })

  .filter('kelvinToCelsius', function() {
    return function(kelvin) {
      return parseFloat(kelvin) - 273.15;
    };
  });
})();
