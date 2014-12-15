(function() {
  'use strict';

  angular.module('app', ['onsen'])

  .filter('kelvinToCelsius', function() {
    return function(kelvin) {
      return parseFloat(kelvin) - 273.15;
    };
  });
})();
