'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('mobileViewTestData', [function() {
        return {
            restrict: 'EA',
            scope: {
                studentTestScores: '=',
                gradeLevel: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/mobile/testData_template.html',
            controller: ['$scope', '$timeout', '$document', 'mainViewLogic', 'colorLogic', 
                    function($scope, $timeout, $document, mainViewLogic, colorLogic) {
                $scope.leftColumn = [];
                $scope.rightColumn = [];
                $scope.isAnimating = false;
        
                // Start Darkmode Check
                $scope.darkMode = mainViewLogic.getDarkMode();
                const cleanupDarkModeListener = mainViewLogic.setupListener((isDarkMode) => {
                    $scope.$apply(() => {
                        $scope.darkMode = isDarkMode;
                        $scope.testHistGraph.chart.theme = $scope.darkMode ? "candy" : "fusion";
                        for (const record of $scope.leftColumn) {
                            if (record.graphCalculated && record.testGraphData && record.testGraphData.chart) {
                                record.testGraphData.chart.theme = $scope.darkMode ? "candy" : "fusion";
                            }
                        }
                        for (const record of $scope.rightColumn) {
                            if (record.graphCalculated && record.testGraphData && record.testGraphData.chart) {
                                record.testGraphData.chart.theme = $scope.darkMode ? "candy" : "fusion";
                            }
                        }
                    });
                });
                $scope.$on('$destroy', cleanupDarkModeListener);
                // End Darkmode Check

                function updateMaxHeight() {
                    const element = $document[0].querySelector('.test-data-view');
                    if (!element) return;
            
                    const contentHeight = element.scrollHeight * 2;
            
                    element.style.maxHeight = `${contentHeight}px`;

                }

                $scope.$watch('showTestData', function (newValue) {
                    $timeout(updateMaxHeight, 0);
                });

                $scope.$watch('studentTestScores', function() {
                    [$scope.leftColumn, $scope.rightColumn] = mainViewLogic.filterTestRecords($scope.studentTestScores, $scope.gradeLevel);
                    $scope.showTestData = true;
                    $timeout(updateMaxHeight, 0);
                });
                
                $scope.previewColor = (colorcode, size = '24px') => {
                    return colorLogic.previewColor(colorcode, size);
                }
                
                $scope.openTestGraph = function(record) {
                    record.graphExpand = !record.graphExpand;
                    if (!record.graphCalculated) {
                        record.testGraphData = mainViewLogic.setGraphData(
                                'lrp-test', 
                                $scope.studentTestScores, 
                                $scope.darkMode,
                                $scope.tranTags.test_score,
                                $scope.tranTags.benchmark,
                                $scope.tranTags.historical_test_records, 
                                $scope.tranTags.test_windows, 
                                $scope.tranTags.score,
                                record.testscoredcid
                            );
                        record.graphCalculated = true;
                    }
                    updateMaxHeight();
                }
            }]
        };
    }]);
});