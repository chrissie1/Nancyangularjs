function PlantsController($scope, $routeParams, Plant) {
    $scope.plants = [];
    $scope.myOptions = { 
        data: 'plants', 
        columnDefs: [
                        { field:'Id', displayName:'Id'},
                        { field: 'Name', displayName: 'Name', cellTemplate: '<a href="#/plants/{{row.entity.Id}}">{{row.entity.Name}}</a>' },
                        { field: 'Genus', displayName: 'Genus' },
                        { field: 'DateAdded', displayName: 'Date added', cellFilter: "moment" },
                        { field: 'Id', displayName: 'Delete', cellTemplate: '<button ng-click="delete(row.entity.Id, row.rowIndex-1)">delete</button>' },
                        { field: 'Id', displayName: 'Update', cellTemplate: '<a href="#/plants/update/{{row.entity.Id}}">update</a>' }
        ]
    };
    $scope.plants = Plant.query();

    $scope.delete = function (id, index) {
        Plant.delete({ plantId: id },
            function () {
                $scope.plants.splice(index, 1);
            }
        );
    };
}

function PlantController($scope, $routeParams, Plant) {
    $scope.plant = Plant.get({ plantId: $routeParams.Id });
}

function PlantUpdateController($scope, $routeParams, $location, Plant) {
    $scope.plant = Plant.get({ plantId: $routeParams.Id });
    $scope.update = function(id) {
        Plant.update({ plantId: id },$scope.plant, function() {
            for (var i = 0; i < $scope.plants.length; i++) {
                if ($scope.plants[i].Id == id) {
                    $scope.plants[i] = $scope.plant;
                }
            }
            $location.path("/plants");
        }, function () { $location.path("error"); });
    };
}

function PlantCreateController($scope, $location, Plant) {
    $scope.plant = {Name:"",Genus:""};
    $scope.create = function () {
        Plant.save($scope.plant, function (returnobject) {
            $scope.plants.push(returnobject);
            $location.path("/plants");
        }, function () { $location.path("error"); });
    };
}

function ErrorController($scope) {
    scope.message = "";
}