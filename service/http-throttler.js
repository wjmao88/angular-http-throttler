/**
 * @license HTTP Throttler Module for AngularJS
 *
 * Sourced from https://github.com/mikepugh/angular-http-throttler
 *
 * (c) 2013 Mike Pugh
 * License: MIT
 */

angular.module('lo.utilities')
.factory('httpThrottler', function ($q, httpBuffer) {
  'use strict';

  var service = {
    ongoingRequestCount: function(){
      return httpBuffer.reqCount;
    },
    setMaxConcurrentRequests: function(val){
      return httpBuffer.maxConcurrentRequests =
        val || httpBuffer.maxConcurrentRequests;
    },
    request: function(config) {
      var deferred = $q.defer();
      httpBuffer.append(deferred);
      return deferred.promise.then(function(){
        return config;
      });
    },
    response: function(response) {
      httpBuffer.requestComplete();
      return $q.when(response);
    },
    responseError: function(rejection) {
      httpBuffer.requestComplete();
      return $q.reject(rejection);
    }
  };

  return service;
})
.factory('httpBuffer', function() {
  'use strict';

  var service = {
    maxConcurrentRequests: 5,
    buffer: [],
    reqCount: 0,

    append: function(deferred){
      service.buffer.push(deferred);
      service.retryOne();
    },

    requestComplete: function(){
      service.reqCount--;
      service.retryOne();
    },

    retryOne: function(){
      if (service.reqCount < service.maxConcurrentRequests) {
        var deferred = service.buffer.shift();
        if (deferred) {
          service.reqCount++;
          deferred.resolve();
        }
      } else {
        console.warn('Too many requests');
      }
    }
  };

  return service;
});
