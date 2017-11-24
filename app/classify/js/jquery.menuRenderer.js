/*
 * Convert JSON to menu elements
 *
 * Copyright (c) 2017 Mohamed Tawfik
 * Licensed under the MIT license.
 */

(function($) {
    var completeOutput = '';

    $.fn.menuRenderer = function(options) {
        return this.each(function() {

            var $this = $(this);

            if(options.JSONString !== null){
                $.menuRenderer(options, $this);
            }
        });
    };

    // Static method.
    $.menuRenderer = function(options, $this) {
        // Override default options with passed-in options.
        options = $.extend({}, $.menuRenderer.options, options);

        var jsonObject = JSON.parse(options.JSONString),
            modifiedJSON= [];

        // Modify JSON to mark top level items
        $(jsonObject).each(function (i, object){
            object.topLevel = true;
            modifiedJSON.push(object);
        });

        // Reset completeOutput variable
        completeOutput = '';

        // Start recursive loop
        recursiveLoop(modifiedJSON, options, 0);

        if(options.renderTo !== null){
            $(options.renderTo).html(completeOutput);
        }

        if($this){
            // Show output
            $this.html(completeOutput);
        }

        // Callback after render
        options.afterRender();
    };

    // Recursive function
    function recursiveLoop(objects, options, level){

        // Check max levels
        if(options.maxLevels > -1){
            if(level > options.maxLevels) return true;
        }

        // Loop through objects
        $(objects).each(function (i, object){

            // Check if object is a top level
            if(object.topLevel) level=0;

            // Define variables
            var keys = Object.keys(object),
                itemElement = options.itemElement,
                recursiveElement = options.recursiveElement,
                hasChildren = false;

            var template;

            if(object.children && object.children.length > 0) hasChildren = true;

            // If template string defined
            if(options.itemTemplate !== null){
                template = options.itemTemplate;
            }

            // If template selector defined
            if(options.itemTemplateSelector !== null && $(options.itemTemplateSelector).html()){
                template = $(options.itemTemplateSelector).html();
            }

            $(keys).each(function (i, key){
                // Skip "children" key
                if(key === "children") return true;

                // Replace template variables with JSON values
                template = template.replace(new RegExp('{' + key + '}', 'g'), object[key]);
            });

            completeOutput += '<' + itemElement;

            if(hasChildren) completeOutput += ' class="' + options.parentClass + '"';

            completeOutput += '>';

            completeOutput += template;

            if(hasChildren){
                completeOutput += '<'+recursiveElement+'>';

                // Loop through children
                recursiveLoop(object.children, options, ++level);

                completeOutput += '</'+recursiveElement+'>';
            }

            completeOutput += '</'+itemElement+'>';

        });

    }

    // Default plugin options
    $.menuRenderer.options = {
        // Default options
        renderTo: null,
        JSONString: null,
        itemTemplate: null,
        itemTemplateSelector: null,
        itemElement: 'li',
        recursiveElement: 'ol',
        parentClass: 'parent',
        maxLevels: -1,

        // Callbacks
        afterRender: function (){}
    };
})(jQuery);
