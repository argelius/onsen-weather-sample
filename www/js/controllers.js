// controllers.js

(function() {
  'use strict';

  angular.module('app')

  .controller('WeatherController', function($scope, $window, $geolocation, $weather, $interval) {

    // Create popover when Onsen UI is loaded.
    ons.ready(function() {
      ons.createPopover('menu.html').then(
        function(popover) {
          $scope.menu = popover;
        }
      );
    });

    // Load saved cities from Local Storage.
    $scope.places = angular.fromJson($window.localStorage.getItem('places') || '[]');

    // Add a new place and and refresh carousel.
    $scope.addPlace = function(place) {
      $scope.places.push(place);
      $window.localStorage.setItem('places', angular.toJson($scope.places));

      setImmediate(function() {
        app.carousel.refresh();
        app.carousel.setActiveCarouselItemIndex($scope.places.length + 1);
      });
    };

    // Remove place and refresh carousel. 
    $scope.removePlace = function(index) {
      $scope.places.splice(index, 1);
      $window.localStorage.setItem('places', angular.toJson($scope.places));

      setImmediate(function() {
        app.carousel.refresh();
      });
    };

    // Update local weather and refresh carousel. 
    $scope.updateLocalWeather = function() {
      $geolocation.get().then(
        function(position) {
          $weather.byLocation(position.coords).then(
            function(weather) {
              $scope.localWeather = weather;
              setImmediate(function() {
                app.carousel.refresh();
              });
            }
          );
        }
      );
    };

    //  Update weather for all saved places.
    $scope.updateWeather = function() {
      $scope.updateLocalWeather();

      var updatePlace = function(place, i) {
        // Search by City ID.
        $weather.byCityId(place.id).then(
          function(result) {
            $scope.places[i] = result;
          }
        );
      };
      for (var i = 0, l = $scope.places.length; i < l; i ++) {
        updatePlace($scope.places[i], i);
      }
    };
    // Update local weather when app starts.
    $scope.updateLocalWeather();
    
    // Update weather every minute.
    $interval($scope.updateWeather, 60000);
  })

  .controller('MenuController', function($scope, $weather, $window) {

    // Search for a place and add it.
    $scope.search = function() {
      app.searchButton.startSpin();

      $weather.byCityName($scope.query).then(
        function(result) {
          // Don't add place if it's already added.
          for (var i = 0, l = $scope.places.length; i < l; i ++) {
            var place = $scope.places[i];
            if (place.id === result.id) {
              ons.notification.alert({
                message: 'City already added.'
              });
              return;
            }
          }
          $scope.addPlace(result);
          $scope.menu.hide();
        },
        function() {
          // Search failed.
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
  });
})();
