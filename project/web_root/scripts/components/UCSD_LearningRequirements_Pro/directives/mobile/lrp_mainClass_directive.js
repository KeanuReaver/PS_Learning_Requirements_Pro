'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('mobileViewClassData', [function() {
        return {
            restrict: 'EA',
            scope: {
                classList: '=',
                showUngraded: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/mobile/classData_template.html',
            controller: ['$scope', '$sce', 'mainViewLogic', 'getTrend', function($scope, $sce, mainViewLogic, getTrend) {
                $scope.darkMode = false;
                $scope.stdDisplay = [];
                $scope.stdTitle = '';

                // Start Darkmode Check
                $scope.darkMode = mainViewLogic.getDarkMode();
                const cleanupDarkModeListener = mainViewLogic.setupListener((isDarkMode) => {
                    $scope.$apply(() => {
                        $scope.darkMode = isDarkMode;
                        $scope.stdHistGraph.chart.theme = $scope.darkMode ? "candy" : "fusion";
                    });
                });
                $scope.$on('$destroy', cleanupDarkModeListener);

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
                
                $scope.openStdDrawer = function(record) {
                    $j('#lrp-std-drawer').animate({ width: '100%' }, 500);
                    $j('body').css('overflow-y', 'hidden');
                    record.expanded = true;
                    $scope.stdDisplay = record;
                    
                }

                $scope.shouldShow = function(data, type = 'prev') {
                    if (type === 'current') {
                        return $scope.classList.filter(crs => $scope.filterCurrent(crs)).length > 0;
                    } 
                    return $scope.classList.filter(crs => $scope.filterPrev(crs)).length > 0;
                    
                }
            }]
        };
    }]);
});