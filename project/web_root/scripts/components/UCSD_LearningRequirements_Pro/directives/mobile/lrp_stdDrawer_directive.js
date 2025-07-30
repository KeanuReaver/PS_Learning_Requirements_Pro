'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');
    
    module.directive('lrpStdDrawer', function() {
        return {
            restrict: 'EA',
            scope: {
                stdDisplay: '=',
                darkMode: '=',
                showUngraded: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/mobile/stdDrawer_template.html',
            controller: ['$scope', '$document', '$sce', 'getTrend', function($scope, $document, $sce, getTrend) {
                $scope.asmtDisplay = {};
                let isDragging = false;
                let startX = 0;
                let startWidth = 0;
            
                // Add event listeners for both mouse and touch events
                $scope.startDrag = function(event) {
                    isDragging = true;
                    startX = event.pageX || event.touches[0].pageX; // Support touch events
                    if (startWidth === 0) {
                        startWidth = $j('#lrp-std-drawer').width();
                    }
            
                    if (event.type === 'mousedown') {
                        $document.on('mousemove', onMouseMove);
                        $document.on('mouseup', onMouseUp);
                    } else if (event.type === 'touchstart') {
                        $document.on('touchmove', onTouchMove);
                        $document.on('touchend', onTouchEnd);
                    }
                    event.preventDefault();
                };
            
                // Handle mouse movement
                function onMouseMove(event) {
                    if (!isDragging) return;
            
                    const dx = startX - event.pageX;
                    const newWidth = Math.max(0, startWidth + dx); // Prevent width from going below 0
                    $j('#lrp-std-drawer').css('width', `${newWidth}px`);
            
                    if (newWidth + 100 < startWidth) {
                        $scope.closeDrawer();  // Ensure this function exists
                    }
                }
            
                // Handle touch movement
                function onTouchMove(event) {
                    if (!isDragging) return;
            
                    const dx = startX - event.touches[0].pageX;
                    const newWidth = Math.max(0, startWidth + dx); // Prevent width from going below 0
                    $j('#lrp-std-drawer').css('width', `${newWidth}px`);
            
                    if (newWidth + 100 < startWidth) {
                        $scope.closeDrawer();  // Ensure this function exists
                    }
                }
            
                // Handle mouse release
                function onMouseUp() {
                    isDragging = false;
                    $document.off('mousemove', onMouseMove);
                    $document.off('mouseup', onMouseUp);
                    $j('#lrp-std-drawer').css('width', '100%');  // Reset to full width
                }
            
                // Handle touch release
                function onTouchEnd() {
                    isDragging = false;
                    $document.off('touchmove', onTouchMove);
                    $document.off('touchend', onTouchEnd);
                    $j('#lrp-std-drawer').css('width', '100%');  // Reset to full width
                }
    
                $scope.closeDrawer = function() {
                    $j('#lrp-std-drawer').animate({ width: '0', minWidth: '0' }, 500);
                    $j('body').css('overflow-y', 'auto');
                    startWidth = 0;
                    startX = 0;
                };
    
                $scope.openAsmtDrawer = function(record) {
                    $j('#lrp-asmt-drawer').animate({ width: '100%' }, 500);
                    $j('body').css('overflow-y', 'hidden');
                    record.expanded = true;
                    $scope.asmtDisplay = record;
                };
                
                $scope.getBkgColor = function(colorcode) {
                    return {
                        'background-color': `${colorcode}`
                    }
                }
                
                $scope.trustedHtml = function (html) {
                    return $sce.trustAsHtml(html);
                }
                        
                $scope.filterCurrent = function (crs) {
                    return crs.iscurrent == '1';
                }
        
                $scope.filterPrev = function (crs) {
                    return crs.iscurrent != '1' && crs.iscurrent != '-1';
                }
                
                $scope.getTrend = function (trend) {
                    if (isNaN(trend)) {
                        return null;
                    }
                
                    // Choose the appropriate icon.
                    let icon;
                    if (trend > 0) {
                        icon = "/images/dist/teacher_tools/images/icons/improve-green-30x30.svg";
                    } else if (trend < 0) {
                        icon = "/images/dist/teacher_tools/images/icons/decline-red-30x30.svg";
                    } else {
                        icon = "/images/img/frame-menu-top-bar.png";
                    }
                
                    // Return the image source with the style attribute for rotation.
                    return icon;
                };
        
                $scope.getArrowRotation = function(trend) {
                    let filter = ((trend === 0 || !trend) && $scope.darkMode) ? 'brightness(1.5)' : 'brightness(1)';
                    return getTrend.arrowRotation(trend, filter);
                }
                
                $scope.getPrintArrowRotation = function(trend) {
                    return getTrend.arrowRotation(trend, '1.5rem', 'brightness(1)', '9px');
                }
                
                $scope.parseStyle = function (styleString) {
                    try {
                        return {
                            'background': `${styleString}`
                        }
                    } catch (e) {
                        console.error('Failed to parse style:', styleString, e);
                        return {};  // Return empty object in case of failure
                    }
                }

                $scope.getFilteredStandards = function(standards) {
                    if ($scope.showUngraded) {
                        return standards;
                    }
                    return standards.filter(standard => {
                        standard.grades.some(grade => grade.score !== '--');
                    });
                }
                
                $scope.standardFilter = function(standard) {
                    if ($scope.showUngraded) {
                        return true; // Show all if showUngraded is true
                    }
                    return standard.assignments.length > 0 || standard.grades.some(grade => grade.score !== '--');
                }
            }]
        };
    });
});