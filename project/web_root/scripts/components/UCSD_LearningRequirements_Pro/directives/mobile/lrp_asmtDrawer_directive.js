'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');
    
    module.directive('lrpAsmtDrawer', function() {
        return {
            restrict: 'EA',
            scope: {
                asmtDisplay: '=',
                darkMode: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/mobile/asmtDrawer_template.html',
            controller: ['$scope', '$document', '$sce', 'mainViewLogic', function($scope, $document, $sce, mainViewLogic) {
                let isDragging = false;
                let startX = 0;
                let startWidth = 0;
                $scope.stdHistGraph = {};
                
                $scope.startDrag = function(event) {
                    isDragging = true;
                    startX = event.pageX || event.touches[0].pageX; // Support touch events
                    if (startWidth === 0) {
                        startWidth = $j('#lrp-asmt-drawer').width();
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
                    $j('#lrp-asmt-drawer').css('width', `${newWidth}px`);
            
                    if (newWidth + 100 < startWidth) {
                        $scope.closeDrawer();  // Ensure this function exists
                    }
                }
            
                // Handle touch movement
                function onTouchMove(event) {
                    if (!isDragging) return;
            
                    const dx = startX - event.touches[0].pageX;
                    const newWidth = Math.max(0, startWidth + dx); // Prevent width from going below 0
                    $j('#lrp-asmt-drawer').css('width', `${newWidth}px`);
            
                    if (newWidth + 100 < startWidth) {
                        $scope.closeDrawer();  // Ensure this function exists
                    }
                }
            
                // Handle mouse release
                function onMouseUp() {
                    isDragging = false;
                    $document.off('mousemove', onMouseMove);
                    $document.off('mouseup', onMouseUp);
                    $j('#lrp-asmt-drawer').css('width', '100%');  // Reset to full width
                }
            
                // Handle touch release
                function onTouchEnd() {
                    isDragging = false;
                    $document.off('touchmove', onTouchMove);
                    $document.off('touchend', onTouchEnd);
                    $j('#lrp-asmt-drawer').css('width', '100%');  // Reset to full width
                }
                
                $scope.closeDrawer = function() {
                    console.log('this ran');
                    $j('#lrp-asmt-drawer').animate({ width: '0', minWidth: '0' }, 500);
                    $j('body').css('overflow-y', 'auto');
                    startWidth = 0;
                    startX = 0;
                }
                
                $scope.getBkgColor = function(colorcode) {
                    return {
                        'background-color': `${colorcode}`
                    }
                }
                
                $scope.trustedHtml = function(html) {
                    return $sce.trustAsHtml(html);
                }
                
                $scope.parseStyle = function(styleString) {
                    try {
                        return {
                            'background': `${styleString}`
                        }
                    } catch (e) {
                        console.error('Failed to parse style:', styleString, e);
                        return {};  // Return empty object in case of failure
                    }
                }
                
                $scope.fixDesc = function(des) {
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
                
                $scope.openStdGraph = function(record) {
                    record.stdHistGraph = {};
                    console.log(record);
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
                    record.stdHistTitle = "Grading History for " + record.standardName;
                    
                    record.stdHistGraph = {
                        chart: {
                            caption: "Assignment Scores and Trends",
                            xAxisName: "Due Date",
                            theme: ($scope.darkMode) ? 'candy' : 'fusion',
                            lineColor: chartData.trendLineColor,
                            animation: 1
                            
                        },
                        categories: chartData.categories,
                        dataset: chartData.dataset
                    };
                    
                    $scope.stdHistGraph = record.stdHistGraph;
                    $scope.$applyAsync();
                    console.log(record.stdHistGraph);
                    record.graphExpand = !record.graphExpand;
                };
            }]
        };
    });
});