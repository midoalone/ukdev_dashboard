jQuery(function ($){

    // Icon picker
    var $focusedIconInput;
    $('.icp-auto').iconpicker();

    $(window).scroll(function() {
        if($focusedIconInput !== null){
            repositionMenu();
        }
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
    
    // Draggable items
    $('#bb-main-items').sortable({
        helper: "clone",
        revert: "invalid",
        handle: '.bb-classify-drag-handler'
    });

    // Sortable menu area
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

    function autoSave(){
        var ret = [];

        $('ol.bb-classify-area').children('li').each(function() {
            var level = _recursiveItems(this);
            ret.push(level);
        });

        $("#log").text(JSON.stringify(ret, null, 4));

        function _recursiveItems(item) {
            var id = $(item).attr("data-id"),
                currentItem;

            var data = {
                id : $(item).attr('data-id'),
                icon : $(item).attr('data-icon'),
                title : $(item).attr('data-title'),
                url : $(item).attr('data-url')
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
            $focusedIconInput.closest('li').attr('data-icon', icon);
            $focusedIconInput.val(icon);
            $focusedIconInput = null;
            $('.iconpicker-container').hide();
        })
        .on('input', '.classify-item-title', function () {
            var value = $(this).val();
            $(this).closest('.bb-classify-item').find('.bb-classify-item-title>span').text(value);
            $(this).closest('li').attr('data-title', value);

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
        });
});