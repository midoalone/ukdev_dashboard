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

    // Switch button
    $(".bb-switch").bootstrapSwitch({
        onText: "Show",
        offText: "Hide",
        size: "mini",
        onColor: "success",
        offColor: "danger"
    });

    // Draggable items
    $('.bb-sortable-static li').draggable({
        helper: "clone",
        revert: "invalid",
        connectToSortable: '.bb-menu-area'
    });

    // Sortable menu area
    $('ol.bb-menu-area').nestedSortable({
        items: 'li',
        isTree: true,
        change: function () {
            cleanLevelClasses();
        },
        receive: function () {
            cleanLevelClasses();
            autoSave();
        },
        stop: function(event, ui) {
            if ($(ui.item).closest('ol').parent('li').hasClass("no-nest")) {
                $("ol.bb-menu-area").sortable("cancel");
            }
            autoSave();
        }
    });

    cleanLevelClasses();

    function cleanLevelClasses(){
        $('ol.bb-menu-area li').removeClass (function (index, className) {
            return (className.match (/(^|\s)level-\S+/g) || []).join(' ');
        });
    }

    function autoSave(){
        var ret = [];

        $('ol.bb-menu-area').children('li').each(function() {
            var level = _recursiveItems(this);
            ret.push(level);
        });

        $("#log").text(JSON.stringify(ret));

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

    $('.bb-menu-save').click(function (){
        autoSave();
    });

    $('.bb-menu-settings').click(function (){
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

    $('.bb-sortable-static .bb-menu-item-title').each(function (){
        var $this = $(this);

        $this.append(
            '<a href="javascript:" class="bb-add-to-menu pull-right">\n' +
            ' <i class="fa fa-plus"></i>\n' +
            '</a>'
        );
    });

    $('.bb-sortable-static:not(.bb-sortable-group)>li').each(function (){
        var $this = $(this);

        var title = $this.find('.bb-menu-item-title>span').text();
        $this.attr("data-title", title);
        $this.attr("data-icon", '');
        $this.attr("data-url", $this.find('.item-url').val());

        $this.find('.menu-item-title').val(title);
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
            $focusedIconInput.closest('.bb-menu-item').find('.bb-menu-item-title>i').attr('class', 'fa ' + icon);
            $focusedIconInput.closest('li').attr('data-icon', icon);
            $focusedIconInput.val(icon);
            $focusedIconInput = null;
            $('.iconpicker-container').hide();
        })
        .on('input', '.menu-item-title', function () {
            var value = $(this).val();
            $(this).closest('.bb-menu-item').find('.bb-menu-item-title>span').text(value);
            $(this).closest('li').attr('data-title', value);

            repositionMenu();
        })
        .on('click', '.bb-menu-collapse', function () {
            var $this = $(this);
            var body = $this.closest('.bb-menu-item').find('.bb-menu-item-body');
            var bodyGroup = $this.closest('li').find('.bb-menu-group-body');
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
        .on('click', '.bb-menu-delete', function () {
            var $this = $(this);
            var item = $this.closest('li');

            item.slideUp(function () {
                $(this).remove();
                autoSave();
            });
        })
        .on('click', '.bb-add-to-menu', function (){
            var $this = $(this);
            var item = $this.closest('li[data-id]').clone();
            $('.bb-menu-area').append(item).ready(function () {
                cleanLevelClasses();
                autoSave();
            });
        })
        .on('change', '[name=display_roles]', function (){
            var specific = $(this).closest('.bb-menu-form').find('.specific');
            var others = $(this).closest('.bb-menu-form').find('.bb-other-visitors-panel');
            var value = $(this).val();

            if(value === 'specific'){
                specific.removeClass('hide');
                others.removeClass('hide');
                $('[name=selected_roles]').trigger('click');
            }else{
                others.addClass('hide');

                if(value !== "all"){
                    others.removeClass('hide');
                }

                specific.addClass('hide');
            }
        })
        .on('click', '[name=selected_roles]', function (){
            var $this = $(this);
            var notSelected = $this.find('option:not(:selected)');
            var rolesOptions = $('.bb-menu-roles-options');
            var optionsHTML = "";

            rolesOptions.html('');

            $(notSelected).each(function (i, name){
                var template = $('#option_template').html();
                template = template.replace('[name]', $(this).val());
                optionsHTML += template;
            });

            rolesOptions.html(optionsHTML);
        })
        // Role list and functions
        .on('click', '.bb-roles-list>.list-group-item .bb-role-hide-others', function (){
            var $this = $(this),
                $element = $this.closest(".list-group-item");

            $('.bb-roles-list>.list-group-item').each(function (){
                $(this)
                    .attr("data-display", "hide")
                    .find("i.fa-circle").removeClass("text-success").addClass("text-danger");
            });

            $element
                .attr("data-display", "show")
                .find("i.fa-circle").addClass("text-success").removeClass("text-danger");
        })
        .on('switchChange.bootstrapSwitch', '.bb-roles-list>.list-group-item .bb-role-toggle', function(event, state) {
            var $this = $(this),
                $element = $this.closest(".list-group-item");

            $('.what-to-show-panel').addClass("hide");
            $('.bb-roles-list>.list-group-item').removeClass("active");

            if(state === true){
                $element.attr("data-display", "show");
            }else{
                $element.attr("data-display", "hide");
            }
        })
        .on('click', '.bb-roles-list>.list-group-item', function (){
            var checked = $(this).find('[type=checkbox].bb-role-toggle:not(:checked)').val();
            $('.bb-roles-list>.list-group-item').removeClass("active");

            if(checked){
                var role = $(this).data("role");
                $(this).addClass("active");

                $('.what-to-show-panel').addClass("hide");
                $('.what-to-show-panel[data-for='+role+']').removeClass("hide");
            }

        })
        .on('change', '.what-to-show-panel select', function (){
            var value = $(this).val();
            var $panel = $(this).closest(".what-to-show-panel");

            $panel.find('[data-render]').addClass("hide");
            $panel.find('[data-render='+value+']').removeClass("hide");
        })
        .on('input', '#bb-role-filter', function (){
            var $this = $(this),
                filter = $this.val().toUpperCase();

            $('.bb-roles-list>.list-group-item').each(function (){
                if($(this).attr("data-title").toUpperCase().indexOf(filter) > -1){
                    $(this).removeClass("hide");
                }else{
                    $(this).addClass("hide");
                }
            });
        })
        .on('click', '.bb-bulk-roles', function (){
            var action = $(this).data("bulk"), display;

            $('.what-to-show-panel').addClass("hide");
            $('.bb-roles-list>.list-group-item').removeClass("active");

            if(action === "hide"){
                display = "hide";
            }
            else if(action === "show" || action === "members"){
                display = "show";
            }

            $('.bb-roles-list>.list-group-item').each(function (){
                $(this).attr("data-display", display);
                if(display === "show") $(this).find('[type=checkbox].bb-role-toggle').bootstrapSwitch('state', true);
                if(display === "hide") $(this).find('[type=checkbox].bb-role-toggle').bootstrapSwitch('state', false);
            });

            if(action === "members"){
                $('.bb-roles-list>.list-group-item[data-role=guests]').attr("data-display", "hide");
                $('.bb-roles-list>.list-group-item[data-role=guests]').find('[type=checkbox].bb-role-toggle').bootstrapSwitch('state', false);
            }

        });
});