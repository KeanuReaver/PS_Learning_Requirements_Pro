'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('mainViewTestData', [function() {
        return {
            restrict: 'EA',
            scope: {
                studentTestScores: '=',
                gradeLevel: '=',
                tranTags: '=',
                showColors: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/main/testData_template.html',
            controller: ['$scope', '$timeout', '$document', 'mainViewLogic', 'colorLogic', 'Luxon',
                    function($scope, $timeout, $document, mainViewLogic, colorLogic, Luxon) {
                $scope.leftColumn = [];
                $scope.rightColumn = [];
                $scope.testHistGraph = [];
                $scope.showTestData = false;
                $scope.isAnimating = false;
                $scope.showLabels = true;
                $scope.darkMode = false;
        
                // Start Darkmode Check
                $scope.darkMode = mainViewLogic.getDarkMode();
                const cleanupDarkModeListener = mainViewLogic.setupListener((isDarkMode) => {
                    $scope.$apply(() => {
                        $scope.darkMode = isDarkMode;
                        $scope.testHistGraph.chart.theme = $scope.darkMode ? "candy" : "fusion";
                    });
                });
                $scope.$on('$destroy', cleanupDarkModeListener);
                // End Darkmode Check

                function updateMaxHeight() {
                    const element = $document[0].querySelector('.test-data-view');
                    if (!element) return;
            
                    const contentHeight = element.scrollHeight + 500;
            
                    if ($scope.showTestData) {
                        element.style.maxHeight = `${contentHeight}px`;
                    } else {
                        element.style.maxHeight = '0';
                    }
                }

                $scope.$watch('showTestData', function (newValue) {
                    $timeout(updateMaxHeight, 0);
                });

                $scope.$watch('showLabels', function () {
                    if ($scope.showTestData && $scope.showLabels) {
                        $timeout(updateMaxHeight, 0);
                    }
                });

                $scope.toggleTestData = function () {
                    $scope.showTestData = !$scope.showTestData;
                };

                $scope.$watch('studentTestScores', function () {
                    [$scope.leftColumn, $scope.rightColumn] = mainViewLogic.filterTestRecords($scope.studentTestScores, $scope.gradeLevel);
                
                    $scope.showTestData = true;
                    $timeout(updateMaxHeight, 0);
                });

                $scope.openPopup = function (record) {
                    $scope.testHistGraph = mainViewLogic.setGraphData(
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
                    $scope.isPopupOpen = true;
                    $scope.popupTitle = "Details for " + record.testname;

                    $scope.popupPosition = {
                        top: '100px',
                        left: '100px',
                    };
                    
                    $timeout(() => {
                        const popup = document.querySelector('.lrp-popup.open');
                        if (popup) {
                            popup.setAttribute('tabindex', '-1');
                            popup.focus();
                        }
                    }, 0);
                };
                
                $scope.previewColor = (colorcode, size = '24px', width = null) => {
                    if ($scope.showColors) {
                        return colorLogic.previewColor(colorcode, size, width);
                    } else if(!$scope.darkMode) {
                        return {
                            'height': size,
                            'width': width || 'auto',
                            'padding': '1px',
                            'color': 'black',
                            'text-shadow': 'none',
                            'margin': '0 auto', 
                            'display': 'block',
                            'line-height': size
                        };
                    }
                    return {
                        'height': size,
                        'width': width || 'auto',
                        'padding': '1px',
                        'background-color': 'inherit',
                        'margin': '0 auto', 
                        'display': 'block',
                        'line-height': size
                    };
                    
                };
                
                $scope.closePopup = function() {
                    $scope.isPopupOpen = false;
                };
            }]
        };
    }]);
});