'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('printViewClassData', [function() {
        return {
            restrict: 'EA',
            scope: {
                classList: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/print/classData_template.html',
            controller: ['$scope', '$sce', 'mainViewLogic', 'getTrend', function($scope, $sce, mainViewLogic, getTrend) {
                $scope.getBkgColor = function(colorcode) {
                    return {
                        'background-color': `${colorcode}`
                    }
                }

                $scope.parseStyle = function (styleString) {
                    try {
                        return {
                            'background': `${styleString}`
                        }
                    } catch (e) {
                        console.error('Failed to parse style:', styleString, e);
                        return {};
                    }
                }
                
                $scope.fixDesc = function (des) {
                    if (des) {
                        let tempString = des;
                        let key = des.substring(0,4)
                        let finalString = '';
                        while (tempString.length > 4) {
                            finalString += '<li>' + tempString.substring(0,tempString.split(key, 2).join(key).length) + '</li>';
                            tempString = tempString.substring(tempString.split(key, 2).join(key).length);
                        }
                        if (finalString) {
                            return finalString
                        }
                    }
                    return '<li>' + des + '</li>'
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
                }
        
                $scope.getArrowRotation = function(trend) {
                    let filter = ((trend === 0 || !trend) && $scope.darkMode) ? 'brightness(1.5)' : 'brightness(1)';
                    return getTrend.arrowRotation(trend, filter);
                }
                
                $scope.getPrintArrowRotation = function(trend) {
                    return getTrend.arrowRotation(trend, '1rem', 'brightness(1)', '9px');
                }
                
                $scope.selectedStyle = function(record, border='') {
                    const defaultColor = ($scope.darkMode) ? '#323F48' : '#a3a3b5';
                    border = (border === '') ? defaultColor : border;
                    if (record.expanded) {
                        console.log('this ran')
                        return {
                            'border-left-color': record.colorcode || border,
                            'border-right-color': record.colorcode || border,
                            'border-bottom-color': record.colorcode || border
                        }
                    } else {
                        return {
                            'border-color': 'black',
                        }
                    }
                }
                
                $scope.getFilteredStandards = function(category) {
                    return category.standards.filter(standard => 
                        standard.grades.some(grade => grade.score !== '--')
                    );
                }
                
                $scope.shouldShow = function(data, type = 'prev') {
                    if (type === 'current') {
                        return $scope.classList.filter(crs => $scope.filterCurrent(crs)).length > 0;
                    } 
                    return $scope.classList.filter(crs => $scope.filterPrev(crs)).length > 0;
                    
                }
            }]
        }
    }])
});