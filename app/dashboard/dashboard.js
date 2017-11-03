'use strict';

angular.module('myApp.dashboard', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl'
        });

        $routeProvider.when('/dashboard/:pageName', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl'
        });
    }])

    .controller('dashboardCtrl', function($scope, $routeParams) {

        // console.log($routeParams.pageName);

        var widgetsText = localStorage.getItem($routeParams.pageName);
        var widgets = JSON.parse(widgetsText);

        $scope.widgets = widgets;

        var pagesText = localStorage.getItem("pages");
        var pages = JSON.parse(pagesText);

        if(pages === null) pages = [];
        $scope.pages = pages;

        // console.log(widgets);

        $scope.addWidget = function (){
            console.log("Hello");
            $scope.widgets.push({
                title: $scope.widget.title,
                content: $scope.widget.content
            });

            console.log($scope.widgets);

            localStorage.setItem($routeParams.pageName, JSON.stringify($scope.widgets));
        };

        $scope.addPage = function (){
            $scope.pages.push({
                title: $scope.page.title,
                slue: $scope.page.slue
            });

            localStorage.setItem($scope.page.slue, JSON.stringify({}));
            localStorage.setItem("pages", JSON.stringify($scope.pages));
        };
    });