'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.service('showBreadcrumbs', function() {
        this.showBread = function(cssString = 'default') {
            let styleElement = $j('#dynamic-css');
    
            const insertCss = cssString === 'default' 
                ? `.breadcrumbs {
                        display: inline !important;
                    }`
                : cssString;
    
            if (styleElement.length === 0) {
                styleElement = $j('<style>', {
                    id: 'dynamic-css',
                    type: 'text/css'
                }).appendTo('head');
            }
    
            styleElement.html(insertCss);
        }
    });
});