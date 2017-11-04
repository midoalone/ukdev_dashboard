'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'gridstack-angular'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl'
        });

        $routeProvider.when('/dashboard/:pageName', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl'
        });
    }])

    .controller('dashboardCtrl', function ($scope, $routeParams, $log, $http) {

        // console.log($routeParams.pageName);

        // Pages
        var pagesText = localStorage.getItem("pages");
        var pages = JSON.parse(pagesText);

        if (pages === null) {
            pages = [{title: "Dashboard", slug: "main"}, {title: "E-Commerce", slug: "commerce"}];
            localStorage.setItem("main", JSON.stringify([]));
            localStorage.setItem("pages", JSON.stringify(pages));
        }

        $scope.pages = pages;

        $scope.addPage = function () {
            $scope.pages.push({
                title: $scope.page.title,
                slue: $scope.page.slug
            });

            localStorage.setItem($scope.page.slug, JSON.stringify([]));
            localStorage.setItem("pages", JSON.stringify($scope.pages));
        };

        // Edit page
        $scope.enablePageEdit = function ($event){
            $($event.target).attr("readonly", false);
        };

        $scope.changePageTitle = function ($event, $page){
            if($event.type === "blur" || ($event.type === "keypress" && $event.which === 13)){
                var $this = $($event.target);
                $this.attr("readonly", true);
                var oldSlug = $page.slug;

                var $pages = [];
                $(pages).each(function (i, page){
                    var pageObject = {
                        title: page.title,
                        slug: page.slug
                    };

                    if($page.slug === page.slug){
                        pageObject.title = $this.val();
                        pageObject.slug = slug($this.val());

                        var pageWidgets = localStorage.getItem(oldSlug);
                        localStorage.setItem(pageObject.slug, pageWidgets);
                        localStorage.removeItem($page.slug);
                    }

                    $pages.push(pageObject);
                });

                localStorage.setItem("pages", JSON.stringify($pages));
            }
        };

        var slug = function(str) {
            var trimmed = $.trim(str);
            var $slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
            replace(/-+/g, '-').
            replace(/^-|-$/g, '');
            return $slug.toLowerCase();
        };

        // Pagination settings
        $scope.activePage = "main";

        $scope.isActive = function ($index) {
            return $scope.active === $index;
        };

        $scope.isPageActive = function ($slug) {
            return $routeParams.pageName === $slug;
        };

        // Widgets
        var widgetsText = localStorage.getItem($routeParams.pageName);
        var widgets = JSON.parse(widgetsText);

        if(widgets !== null){
            $scope.widgets = widgets;
        }else{
            $scope.widgets = [
                {x: 0, y: 0, width: 3, height: 1, id: 'weather'},
                {x: 3, y: 0, width: 3, height: 1, id: 'chart'}
            ];
        }

        // http://localhost:8000/json/weather.json

        localStorage.setItem($routeParams.pageName, JSON.stringify($scope.widgets));

        // Initialize gridstack
        $scope.options = {
            cellHeight: 100,
            verticalMargin: 10
        };

        $('.grid-stack').gridstack($scope.options);
        var grid = $('.grid-stack').data('gridstack');

        // Load saved data
        _.each($scope.widgets, function (node) {
            grid.addWidget($('<div data-id="'+node.id+'"><div class="grid-stack-item-content" /><div/>'),
                node.x, node.y, node.width, node.height);

            getWidgetContent(node.id);
        }, this);

        // Load widgets content
        function getWidgetContent($id){
            $http.get('http://localhost:8000/json/'+$id+'.json').success(function (data) {
                $('[data-id="'+$id+'"]').find('.grid-stack-item-content').html(data.content);
            });
        }

        // Show widget on added
        $('.grid-stack').on('added', function(event, item) {
            $log.log("onItemAdded item: " + item);

            var $item = $(item.el[0]);
            $log.log($item.data("id"));

        });

        // Save on change
        $('.grid-stack').on('change', function(event, items) {
            var $items = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
                el = $(el);
                var node = el.data('_gridstack_node');
                console.log(node);
                return {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    id: el.data("id")
                };
            }, this);

            localStorage.setItem($routeParams.pageName, JSON.stringify($items));
        });

        $scope.addWidget = function () {
            var newWidget = {x: 0, y: 0, width: 1, height: 1};
            $scope.widgets.push(newWidget);
        };

        $scope.removeWidget = function (w) {
            var index = $scope.widgets.indexOf(w);
            $scope.widgets.splice(index, 1);
        };

        $scope.onDragStart = function (event, ui) {
            $log.log("onDragStart event: " + event + " ui:" + ui);
        };

        $scope.onDragStop = function (event, ui) {
            $log.log("onDragStop event: " + event + " ui:" + ui);
        };

        $scope.onResizeStart = function (event, ui) {
            $log.log("onResizeStart event: " + event + " ui:" + ui);
        };

        $scope.onResizeStop = function (event, ui) {
            $log.log("onResizeStop event: " + event + " ui:" + ui);
        };

        $scope.onItemAdded = function (item, api) {
            // $log.log("onItemAdded item: " + item);
            // $log.log(item);

            var $item = $(item.el[0]);

            item.api = api;
            item.id = $item.attr('id');

            $http.get(api).success(function (data) {
                $item.find('.grid-stack-item-content').html(data.content);
            });

        };

        $scope.onItemRemoved = function (item) {
            $log.log("onItemRemoved item: " + item);
        };
    });