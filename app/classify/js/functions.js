jQuery(function ($){

    // Icon picker
    var $focusedIconInput;
    $('.icp-auto').iconpicker();

    $(window).scroll(function() {
        if($focusedIconInput !== null){
            repositionMenu();
        }
    });

    $('.add-item').click(function (){
        var $this = $(this),
            list = $('#' + $this.data('to')),
            itemTemplate = '<li>' + $('#classify-item-template').html() + '</li>',

            itemTitle = $('[name=item_title]'),
            itemIcon = $('[name=item_icon]');

        itemTemplate = itemTemplate.replace(new RegExp('{title}', 'g'), itemTitle.val());
        itemTemplate = itemTemplate.replace(new RegExp('{icon}', 'g'), itemIcon.val());

        // AJAX request to save in DB for main items
        if($this.data('to') === "bb-main-items"){
            // Uncomment the next lines to save in db and return id
//                $.post(ajaxurl, {title: itemTitle.val(), icon: itemIcon.val()}, function (id){
//                    itemTemplate = itemTemplate.replace(new RegExp('{id}', 'g'), id);
//                });

            // Remove this in production
            itemTemplate = itemTemplate.replace(new RegExp('{id}', 'g'), ''+Math.floor((Math.random() * 999999) + 111111)+'');
        }

        list.append(itemTemplate);

        // Reset modal form
        itemTitle.val('');
        itemIcon.val('');

        // Hide modal
        $('#addItemModal').modal('hide');

        // Auto save
        saveMainItems();
    });

    function repositionMenu(){
        if($focusedIconInput){
            var elementTop = $focusedIconInput.offset().top,
                elementLeft = $focusedIconInput.offset().left,
                windowTop = $(window).scrollTop(),
                actualTop = elementTop - windowTop,
                checker = $(window).height() - actualTop,

                iconContainer = $('.iconpicker-container'),
                iconContainerHeight = iconContainer.height(),
                cssTop = actualTop + 30;

            if(checker < actualTop){
                cssTop = actualTop - iconContainerHeight;
            }

            iconContainer.css({
                top: cssTop,
                left: elementLeft
            });

            iconContainer.show();
        }
    }
    
    // Sortable main items
    $('#bb-main-items').sortable({
        helper: "clone",
        revert: "invalid",
        handle: '.bb-classify-drag-handler',
        stop: saveMainItems
    });

    // Nested Sortable children items
    $('#bb-children-items').nestedSortable({
        items: 'li',
        isTree: true,
        handle: '.bb-classify-drag-handler',
        change: function () {
            cleanLevelClasses();
        },
        receive: function () {
            cleanLevelClasses();
            autoSave();
        },
        stop: function(event, ui) {
            if ($(ui.item).closest('ol').parent('li').hasClass("no-nest")) {
                $("ol.bb-classify-area").sortable("cancel");
            }
            autoSave();
        }
    });

    cleanLevelClasses();

    function cleanLevelClasses(){
        $('ol.bb-classify-area li').removeClass (function (index, className) {
            return (className.match (/(^|\s)level-\S+/g) || []).join(' ');
        });
    }

    function saveMainItems(){
        var ret = [];

        $('#bb-main-items').children('li:not(.ui-sortable-placeholder):not(.ui-sortable-helper)').each(function() {

            var $this = $(this),
                $item = $this.find(".bb-classify-item").first();

            var data = {
                id : $item.attr('data-id'),
                icon : $item.attr('data-icon'),
                title : $item.attr('data-title'),
                url : $item.attr('data-url')
            };

            ret.push(data);
        });

        $("#log_main").text(JSON.stringify(ret, null, 4));
    }

    function autoSave(){
        var ret = [];

        $('#bb-children-items').children('li').each(function() {
            var level = _recursiveItems(this);
            ret.push(level);
        });

        $("#log").text(JSON.stringify(ret, null, 4));

        function _recursiveItems(item) {
            var id = $(item).find('.bb-classify-item').first().attr("data-id"),
                currentItem;

            var $this = $(item),
                $item = $this.find(".bb-classify-item").first();

            var data = {
                id : $item.attr('data-id'),
                icon : $item.attr('data-icon'),
                title : $item.attr('data-title'),
                url : $item.attr('data-url')
            };

            if (id) {
                currentItem = {
                    "id": id[2]
                };

                currentItem = $.extend({}, currentItem, data);

                if ($(item).children('ol').children('li').length > 0) {
                    currentItem.children = [];
                    $(item).children('ol').children('li').each(function() {
                        var level = _recursiveItems(this);
                        currentItem.children.push(level);
                    });
                }
                return currentItem;
            }
        }
    }

    $('.bb-classify-save').click(function (){
        autoSave();
    });

    $('.bb-classify-settings').click(function (){
        var $this = $(this);
        var body = $this.closest('.panel').find('.panel-body');

        if ($this.hasClass("expand")) {
            body.slideUp();
            $this.removeClass("expand");
        } else {
            body.slideDown();
            $this.addClass("expand");
        }
    });

    $('.bb-sortable-static .bb-classify-item-title').each(function (){
        var $this = $(this);

        $this.append(
            '<a href="javascript:" class="bb-add-to-menu pull-right">\n' +
            ' <i class="fa fa-plus"></i>\n' +
            '</a>'
        );
    });

    $('.bb-sortable-static:not(.bb-sortable-group)>li').each(function (){
        var $this = $(this);

        var title = $this.find('.bb-classify-item-title>span').text();
        $this.attr("data-title", title);
        $this.attr("data-icon", '');
        $this.attr("data-url", $this.find('.item-url').val());

        $this.find('.classify-item-title').val(title);
    });

    $('body')
        .on("focus",'input.icp', function (){
            $focusedIconInput = $(this);
            repositionMenu();
        })
        .on('blur', 'input.icp', function (){

        })
        .on('iconpickerSelected', '.icp-auto', function (e) {
            var icon = e.iconpickerValue;
            $focusedIconInput.closest('.bb-classify-item').find('.bb-classify-item-title>i').attr('class', 'fa ' + icon);
            $focusedIconInput.closest('.bb-classify-item').attr('data-icon', icon);
            $focusedIconInput.val(icon);
            $focusedIconInput = null;
            $('.iconpicker-container').hide();
        })
        .on('input', '.classify-item-title', function () {
            var value = $(this).val();
            $(this).closest('.bb-classify-item').find('.bb-classify-item-title>span').text(value);
            $(this).closest('.bb-classify-item').attr('data-title', value);

            repositionMenu();
        })
        .on('click', '.bb-classify-collapse', function () {
            var $this = $(this);
            var body = $this.closest('.bb-classify-item').find('.bb-classify-item-body');
            var bodyGroup = $this.closest('li').find('.bb-classify-group-body');
            var icon = $this.find('i');

            if ($this.hasClass("expand")) {
                body.slideUp();
                bodyGroup.slideUp();
                $this.removeClass("expand");
                icon.addClass("fa-caret-down");
                icon.removeClass('fa-caret-up');
            } else {
                body.slideDown();
                bodyGroup.slideDown();
                $this.addClass("expand");
                icon.removeClass("fa-caret-down");
                icon.addClass('fa-caret-up');
            }
        })
        .on('click', '.bb-classify-delete', function () {
            var $this = $(this);
            var item = $this.closest('li');

            item.slideUp(function () {
                $(this).remove();
                autoSave();
            });
        })
        .on('click', '#bb-main-items>li .bb-classify-item-title', function (){
            var $this = $(this),
                item = $this.closest('.bb-classify-item'),
                mainItemID = item.attr("data-id"),
                childrenList = $('#bb-children-items');

            $('.bb-classify-item-title').removeClass('active');
            $this.addClass("active");
            childrenList.html('');

            // Load children json
            var loadChildrenJSON = function (jsonString){
                childrenList.menuRenderer({
                    JSONString: jsonString,
                    itemTemplateSelector: '#classify-item-template',
                    afterRender: function (){

                    }
                });
            };

            // AJAX request to get json for children
            // Uncomment the next lines for ajax
            // $.post(ajaxurl, {id: mainItemID}, function (jsonString){
            //     loadChildrenJSON(jsonString);
            // });

            // Local storage for testing purposes
            // Remove the next lines on production
            var jsonString = localStorage.getItem(mainItemID);
            if(jsonString){
                loadChildrenJSON(jsonString);
            }
        });
});