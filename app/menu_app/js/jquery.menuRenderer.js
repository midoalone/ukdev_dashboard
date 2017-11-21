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
                $.menuRenderer(options);
            }

            $this.html(completeOutput);

        });
    };

    // Static method.
    $.menuRenderer = function(options) {
        // Override default options with passed-in options.
        options = $.extend({}, $.menuRenderer.options, options);

        var jsonObject = JSON.parse(options.JSONString);

        // Reset completeOutput variable
        completeOutput = '';

        $(jsonObject).each(function (i, object){

            // Add to output string
            recursiveLoop(object, options);
        });
    };

    // Recursive function
    function recursiveLoop(object, options){
        var keys = Object.keys(object),
            itemElement = options.itemElement,
            recursiveElement = options.recursiveElement;

        var template;

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
            template = template.replace("{"+key+"}", object[key]);
        });

        completeOutput += '<'+itemElement+'>';

        completeOutput += template;

        if(object.children && object.children.length > 0){
            completeOutput += '<'+recursiveElement+'>';

            // Loop in children
            $(object.children).each(function (i, childObject){
                recursiveLoop(childObject, options);
            });

            completeOutput += '</'+recursiveElement+'>';
        }

        completeOutput += '</'+itemElement+'>';
    }

    // Default plugin options
    $.menuRenderer.options = {
        JSONString: null,
        itemTemplate: null,
        itemTemplateSelector: null,
        itemElement: 'li',
        recursiveElement: 'ol'
    };
})(jQuery);
