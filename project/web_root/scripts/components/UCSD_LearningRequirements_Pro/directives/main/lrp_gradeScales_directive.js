'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('mainViewGradeScales', ['colorLogic', 'mainViewLogic', function(colorLogic, mainViewLogic) {
        return {
            restrict: 'EA',
            scope: {
                gradeScales: '=',
                tranTags: '=',
                showColors: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/main/gradeScales_template.html',
            controller: ['$scope', function($scope) {
                $scope.expandScale = false;
                $scope.currentGradeScale = null;
                $scope.isMobileView = true;

                $scope.toggleGradeScale = function(gradeScale) {
                    // Toggle the active grade scale (tab)
                    if ($scope.currentGradeScale === gradeScale.gradeScales) {
                        $scope.currentGradeScale = null; // Collapse if the same tab is clicked again
                    } else {
                        $scope.currentGradeScale = gradeScale.gradeScales; // Set the clicked grade scale as active
                    }
                    console.log($scope.currentGradeScale);
                }
                
                $scope.darkMode = mainViewLogic.getDarkMode();
                const cleanupDarkModeListener = mainViewLogic.setupListener((isDarkMode) => {
                    $scope.$apply(() => {
                        $scope.darkMode = isDarkMode;
                    });
                });
                $scope.$on('$destroy', cleanupDarkModeListener);
    
                $scope.previewColor = (colorcode, dim = '1em') => {
                    if ($scope.showColors) {
                        return colorLogic.previewColor(colorcode, dim);
                    } else if(!$scope.darkMode) {
                        return {
                            'height': dim,
                            'width': dim,
                            'padding': '1px',
                            'color': 'black',
                            'text-shadow': 'none',
                            'margin': '0 auto', 
                            'display': 'block',
                            'line-height': dim
                        };
                    }
                    return {
                        'height': dim,
                        'width': dim,
                        'padding': '1px',
                        'background-color': 'inherit',
                        'margin': '0 auto', 
                        'display': 'block',
                        'color': 'white !important',
                        'line-height': dim
                    }
                    
                }
            }]
        };
    }]);
});