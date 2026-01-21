'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('mainViewClassData', [function() {
        return {
            restrict: 'EA',
            scope: {
                classList: '=',
                showUngraded: '=',
                tranTags: '=',
                showColors: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/main/classData_template.html',
            controller: ['$scope', '$sce', '$timeout', 'mainViewLogic', 'getTrend', 'timeUtil', function($scope, $sce, $timeout, mainViewLogic, getTrend, timeUtil) {
                $scope.stdHistTitle = '';
                $scope.stdHistGraph = {};
                $scope.popupPosition = {};
                $scope.stdPopOpen = false;
                $scope.darkMode = false;

                // Start Darkmode Check
                $scope.darkMode = mainViewLogic.getDarkMode();
                const cleanupDarkModeListener = mainViewLogic.setupListener((isDarkMode) => {
                    $scope.$apply(() => {
                        $scope.darkMode = isDarkMode;
                        $scope.stdHistGraph.chart.theme = $scope.darkMode ? "candy" : "fusion";
                    });
                });
                $scope.$on('$destroy', cleanupDarkModeListener);
                
                $scope.closeStdPopup = function() {
                    $scope.stdPopOpen = false;
                }
                
                $scope.checkClassAttendance = function (classList) {
                    if (!Array.isArray(classList)) return false;
                    return classList.some(rec =>
                        rec &&
                        rec.attendance &&
                        ('rate' in rec.attendance) &&  // property exists…
                        rec.attendance.rate !== null    // …and is not null (0 is OK)
                    );
                };
                
                $scope.openStdPopup = function (record) {
                    $scope.stdHistGraph = {};
                    let chartData = {};
                    if (record.assignments.length > 0) {
                        chartData = mainViewLogic.setGraphData(
                                'lrp-std',
                                record.assignments,
                                $scope.darkMode,
                                $scope.tranTags.score || 'Score',
                                $scope.tranTags.trend_line || 'Trend Line',
                                '',
                                '',
                                ''
                            );
                    } else {
                        chartData.categories = [];
                        chartData.dataset = [];
                    }
                    $scope.stdHistTitle = ($scope.tranTags.grading_history_for + ' ' || "Grading History for ") + record.standardName;
                    
                    $scope.popupPosition = {
                        top: '100px',
                        left: '100px',
                    };
                    
                    $scope.stdHistGraph = {
                        chart: {
                            caption: $scope.tranTags.assignment_scores_and_trends || "Assignment Scores and Trends",
                            xAxisName: $scope.tranTags.due_date || "Due Date",
                            theme: ($scope.darkMode) ? 'candy' : 'fusion',
                            lineColor: chartData.trendLineColor || '#000',
                            animation: 1
                            
                        },
                        categories: chartData.categories,
                        dataset: chartData.dataset
                    };
                    $scope.stdPopOpen = true;
                };
                
                $scope.getBkgColor = function(colorcode, harmless = false) {
                    if ($scope.showColors || harmless) {
                        return {
                            'background-color': `${colorcode}`
                        }
                    }
                    
                }
                
                function clearExpandedDeep(node) {
                    if (!node || typeof node !== 'object') return;
                
                    // If this object has an `expanded` flag, clear it
                    if (Object.prototype.hasOwnProperty.call(node, 'expanded')) {
                        node.expanded = false;
                    }
                
                    // Walk all properties
                    for (const key in node) {
                        if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
                
                        const val = node[key];
                
                        if (!val || typeof val !== 'object') continue;
                
                        if (Array.isArray(val)) {
                            // Recurse into each item in arrays (standards, assignments, etc.)
                            for (const item of val) {
                                clearExpandedDeep(item);
                            }
                        } else {
                            // Recurse into nested objects
                            clearExpandedDeep(val);
                        }
                    }
                }
                
                $scope.toggleExpand = function(row) {
                    row.expanded = !row.expanded;
                
                    // If we just collapsed this row, also collapse all descendants
                    if (!row.expanded) {
                        clearExpandedDeep(row);
                    }
                
                    // keep your special case
                    if (row.count_expanded) {
                        row.count_expanded = false;
                    }
                }
                
                $scope.toggleExpandComments = function (row, event) {
                    row.comexpanded = !row.comexpanded;
                };
                
                $scope.toggleExpandDescriptions = function (row, event) {
                    row.desexpanded = !row.desexpanded;
                };
                
                $scope.expandWarnings = function (type, classItem) {
                    classItem.expanded = true;
                
                    let firstRelevantAssignmentElement = null; // To store the first relevant assignment DOM element
                
                    for (const cat of classItem.standards) {
                        for (const standard of cat.standards) {
                            standard.expanded = false;
                            let shouldExpandStandard = false;
                
                            for (let index = 0; index < standard.assignments.length; index++) {
                                const assignment = standard.assignments[index];
                
                                if (assignment[type] === '1') {
                                    assignment.expanded = true;
                                    assignment.count_expanded = true;
                                    shouldExpandStandard = true;
                                }
                            }
                
                            if (shouldExpandStandard) {
                                standard.expanded = true;
                            }
                        }
                    }
                }
                
                $scope.formatDate = function(val) {
                    return timeUtil.formatDate(val, 'yyyy-MM-dd');
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
                };
                                
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
                
                $scope.selectedStyle = function(record, border='') {
                    const defaultColor = ($scope.darkMode) ? '#323F48' : '#a3a3b5';
                    border = (border === '') ? defaultColor : border;
                    if (record.expanded) {
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
                
                $scope.shouldShow = function(data, type = 'prev') {
                    if (type === 'current') {
                        return $scope.classList.filter(crs => $scope.filterCurrent(crs)).length > 0;
                    } 
                    return $scope.classList.filter(crs => $scope.filterPrev(crs)).length > 0;
                    
                }

                $scope.standardFilter = function(standard) {
                    if ($scope.showUngraded) {
                        return true; // Show all if showUngraded is true
                    }
                    return standard.assignments.length > 0 || standard.grades.some(grade => grade.score !== '--');
                }
            }]
        };
    }]);
});