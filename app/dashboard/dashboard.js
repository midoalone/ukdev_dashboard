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

    .controller('dashboardCtrl', function ($scope, $routeParams, $log, $http, $location, $timeout) {

        // console.log($routeParams.pageName);

        $('[data-toggle="tooltip"]').tooltip();

        // Pages
        var pagesText = localStorage.getItem("pages");
        var pages = angular.fromJson(pagesText);
        
        // console.log(pages);

        if (pages === null) {
            pages = [{title: "Dashboard", slug: "main"}, {title: "E-Commerce", slug: "commerce"}];
            localStorage.setItem("main", angular.toJson([]));
            localStorage.setItem("pages", angular.toJson(pages));
        }

        $scope.pages = pages;

        $scope.addPage = function () {
            var title = "Page " + ($scope.pages.length + 1);
            var pageSlug = slug(title);

            $scope.pages.push({
                title: title,
                slug: pageSlug
            });

            localStorage.setItem(pageSlug, angular.toJson([]));
            localStorage.setItem("pages", angular.toJson($scope.pages));
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
                var newSlug = slug($this.val());

                if(oldSlug === newSlug) return;

                var $pages = [];
                $(pages).each(function (i, page){
                    var pageObject = {
                        title: page.title,
                        slug: page.slug
                    };

                    if($page.slug === page.slug){
                        pageObject.title = $this.val();
                        pageObject.slug = newSlug;

                        var pageWidgets = localStorage.getItem(oldSlug);
                        localStorage.setItem(pageObject.slug, pageWidgets);
                        localStorage.removeItem($page.slug);
                    }

                    $pages.push(pageObject);
                });

                localStorage.setItem("pages", angular.toJson($pages));
                $scope.pages = pages;

                $location.url("/dashboard/" + newSlug);
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

        // Save next & previous pages
        var nextPage=null,
            prevPage=null,
            currentIndex=null;

        $(pages).each(function (i, $page){
            if($page.slug === $routeParams.pageName) {
                currentIndex = i;
                if(currentIndex !== 0) prevPage = pages[i-1];
                if(currentIndex < pages.length) nextPage = pages[i+1];

                document.title = $page.title;
                console.log($page.title);
            }
        });

        // Previous Page
        $scope.previousPage = function (){
            if(prevPage){
                $location.url("/dashboard/"+prevPage.slug);
            }
        };

        // Next Page
        $scope.nextPage = function (){
            if(nextPage){
                $location.url("/dashboard/"+nextPage.slug);
            }
        };

        // Widgets
        var widgetsText = localStorage.getItem($routeParams.pageName);
        var widgets = angular.fromJson(widgetsText);

        if(widgets !== null){
            $scope.widgets = widgets;
        }else{
            $scope.widgets = [];
        }

        localStorage.setItem($routeParams.pageName, angular.toJson($scope.widgets));

        // Initialize gridstack
        $scope.options = {
            cellHeight: 150,
            verticalMargin: 10
        };

        var gridStack = $('.grid-stack').gridstack($scope.options);
        var grid = $('.grid-stack').data('gridstack');

        // Load saved data
        _.each($scope.widgets, function (node) {
            getWidgetContent(node);
        }, this);

        // Load widgets content
        function getWidgetContent(node){
            grid.addWidget($('<div data-id="'+node.id+'"><div class="grid-stack-item-content" /><i class="glyphicon glyphicon-trash remove-widget"></i><div/>'),
                node.x, node.y, node.width, node.height);

            $http.get('http://localhost:8000/json/'+node.id+'.json').success(function (data) {
                $('[data-id="'+node.id+'"]').find('.grid-stack-item-content').html(data.content);
            });

            // $http.get('http://winkybox.com/ukdev/dashboard/json/'+node.id+'.json').success(function (data) {
            //     $('[data-id="'+node.id+'"]').find('.grid-stack-item-content').html(data.content);
            // });
        }

        // Save on change
        gridStack.on('change', function(event, items) {
            var $items = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
                el = $(el);
                var node = el.data('_gridstack_node');
                // console.log(node);
                return {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    id: el.data("id")
                };
            }, this);

            localStorage.setItem($routeParams.pageName, angular.toJson($items));
        });

        $scope.addWidget = function () {
            var newWidget = {x: 0, y: 0, width: 3, height: 1, id: $scope.widgetSelector};
            $scope.widgets.push(newWidget);
            localStorage.setItem($routeParams.pageName, angular.toJson($scope.widgets));

            getWidgetContent(newWidget);
        };

        // Remove Widget
        $('body')
            .off('click', '.remove-widget')
            .on('click','.remove-widget', function (){
            var item = $(this).closest('.grid-stack-item');
            if(item){
                grid.removeWidget(item);
            }
        });

        // Move widgets
        var movableItem;
        localStorage.removeItem("MovableWidget");

        gridStack.on("dragstart", function (event, item){
            var $item = $(event.target),
                width = $item.data("gs-width"),
                height = $item.data("gs-height"),
                id = $item.data("id");

            localStorage.setItem("MovableWidget", angular.toJson({x:0,y:0,width:width, height:height, id:id}));
            movableItem = item;
        });

        gridStack.on("dragstop", function (){
            localStorage.removeItem("MovableWidget");
        });

        $scope.pageHovered = function (pageSlug){
            var widget = angular.fromJson(localStorage.getItem("MovableWidget"));

            if(widget !== null){
                // Add to target page
                var $targetWidgets = angular.fromJson(localStorage.getItem(pageSlug));
                if($targetWidgets !== null){
                    $targetWidgets.push(widget);
                    localStorage.setItem(pageSlug, angular.toJson($targetWidgets));
                }

                $timeout(function (){
                    $location.url("/dashboard/" + pageSlug);
                }, 100);

            }
        }

    });