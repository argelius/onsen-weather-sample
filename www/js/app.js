(function() {
  'use strict';

  angular.module('app', ['onsen'])

  .controller('WeatherController', function($scope, $window, $geolocation, $weather, $interval) {
    ons.ready(function() {
      ons.createPopover('menu.html').then(
        function(popover) {
          $scope.menu = popover;
        }
      );
    });

    $scope.places = angular.fromJson($window.localStorage.getItem('places') || '[]');

    $scope.updateLocalWeather = function() {
      $geolocation.get().then(
        function(position) {
          $weather.byLocation(position.coords).then(
            function(weather) {
              console.log(weather);
              $scope.localWeather = weather;
              setImmediate(function() {
                app.carousel.refresh();
              });
            }
          );
        }
      );
    };
    $scope.updateLocalWeather();

    $scope.updateWeather = function() {
      $scope.updateLocalWeather();

      for (var i = 0, l = $scope.places.length; i < l; i ++) {
        var place = $scope.places[i];

        (function(i) {
          $weather.byCityId(place.id).then(
            function(result) {
              $scope.places[i] = result;
            }
          );
        })(i);
      }
    };

    // Update weather every minute.
    $interval($scope.updateWeather, 60000);
  })

  .controller('MenuController', function($scope, $weather, $window) {
    $scope.search = function() {
      app.searchButton.startSpin();

      $weather.byCityName($scope.query).then(
        function(result) {
          for (var i = 0, l = $scope.places.length; i < l; i ++) {
            var place = $scope.places[i];
            if (place.id === result.id) {
              ons.notification.alert({
                message: 'City already added.'
              });
              return;
            }
          }

          $scope.places.push(result);
          $window.localStorage.setItem('places', angular.toJson($scope.places));

          $scope.menu.hide();

          setImmediate(function() {
            app.carousel.refresh();
            app.carousel.setActiveCarouselItemIndex($scope.places.length + 1);
          });
        },
        function() {
          ons.notification.alert({
            message: 'Unable to find city.'
          });
        }
      )
      .finally(
        function() {
          app.searchButton.stopSpin();
        }
      );
    };
    
    $scope.removePlace = function(index) {
      $scope.places.splice(index, 1);

      $window.localStorage.setItem('places', angular.toJson($scope.places));

      setImmediate(function() {
        app.carousel.refresh();
      });
    };
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
    var API_ROOT = 'http://api.openweathermap.org/data/2.5/';

    this.byCityName = function(query) {
      var deferred = $q.defer();
  
      $http.jsonp(API_ROOT + '/weather?callback=JSON_CALLBACK&q=' + encodeURI(query)).then(
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
  })

  .filter('kelvinToCelsius', function() {
    return function(kelvin) {
      return parseFloat(kelvin) - 273.15;
    };
  });
})();
