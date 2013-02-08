var app = angular.module('plantsapp', ['ngResource', 'ngGrid', 'plantsapp.factories']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/plants', { templateUrl: 'partials/plants.html', controller: PlantsController }).
        when('/plants/create', { templateUrl: 'partials/insertplant.html', controller: PlantCreateController }).
        when('/plants/:Id', { templateUrl: 'partials/plant.html', controller: PlantController }).
        when('/plants/update/:Id', { templateUrl: 'partials/updateplant.html', controller: PlantUpdateController }).
        when('/error', { templateUrl: 'partials/error.html', controller: ErrorController }).
        otherwise({ redirectTo: '/plants' });
}]);

app.filter('moment', function() {
    return function(dateString) {
        return moment(dateString).format('DD/MM/YYYY h:m');
    };
});






