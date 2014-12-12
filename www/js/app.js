(function() {
  'use strict';

  angular.module('app', ['onsen'])

  .controller('AppController', function($scope, $window) {
    $scope.title = 'Onsen Weather';

    $scope.currentIndex = 0;
    $scope.places = angular.fromJson($window.localStorage.getItem('places') || '[]');
  })

  .controller('SearchController', function($scope, $timeout, $window, $geolocation, $weather) {

    $scope.$watch('query', function(query) {
      if ($scope.searchTimeout) {
        $timeout.cancel($scope.searchTimeout);
      }

      $scope.searchTimeout = $timeout(function() {
        (function(query) {
          $weather.search(query).then(
            function(data) {
              $scope.place = data;
              $scope.place._originalQuery = query;
            },
            function(error) {
            }
          );
        })($scope.query);
      }, 200);
    });

    $scope.addPlace = function(place) {
      for (var i = 0; i < $scope.places.length; i++) {
        if (place.id === $scope.places[i].id) {
          ons.notification.alert({
            message: place.name + ' already added.'
          });
          return;
        }
      }

      $scope.places.push(place);
      $window.localStorage.setItem('places', angular.toJson($scope.places));
    };
  })

  .controller('WeatherController', function($scope) {
    $scope.initialIndex = app.navigator.getCurrentPage().options.initialIndex;
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
