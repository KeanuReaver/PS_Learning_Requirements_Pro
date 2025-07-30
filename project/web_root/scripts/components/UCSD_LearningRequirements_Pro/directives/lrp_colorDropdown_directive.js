'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');
    
    module.directive('lrpCustColorDropdown', function(colorLogic, $document) {
        return {
            restrict: 'EA',
            scope: {
                label: '@',
                item: '=',
                scoreColorList: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/customDropdown_template.html',
            link: function(scope) {
                scope.toggleDropdown = function(item) {
                    item.isDropdownOpen = !item.isDropdownOpen;
                }

                scope.selectColor = function(item, color = null) {
                    if (color && color.id && color.colorcode) {
                        item.colorlistid = color.id || '';
                        item.colorcode = color.colorcode || '';
                    } else {
                        item.colorlistid = '';
                        item.colorcode = '';
                    }
                    item.isdirty = 1;
                    item.isDropdownOpen = false;
                    console.log(item);
                }
                
                scope.previewColor = (color = '') => {
                    return colorLogic.previewColor(color);
                }
                
                const clickOutsideHandler = function(event) {
                    const target = angular.element(event.target);
                    const isClickInsideDropdown = target.closest('.lrp-custom-dropdown').length > 0;

                    if (!isClickInsideDropdown) {
                        scope.$apply(() => {
                            scope.item.isDropdownOpen = false;
                        });
                    }
                };

                $document.on('click', clickOutsideHandler);

                scope.$on('$destroy', function() {
                    $document.off('click', clickOutsideHandler);
                });
            }
        }
    })
});