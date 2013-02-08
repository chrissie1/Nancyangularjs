var factories = angular.module('plantsapp.factories', []);

factories.factory('Plant', function ($resource) {
    return $resource('http://localhost\\:59025/plants/:plantId', {}, {
        update: { method: 'PUT' }
    });
});
