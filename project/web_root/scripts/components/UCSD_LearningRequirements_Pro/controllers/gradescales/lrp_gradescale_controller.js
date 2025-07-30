'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('GradeScaleController', ['$scope', 'gradeScaleOrg', 'dataManagement', 'showBreadcrumbs',
            function($scope, gradeScaleOrg, dataManagement, showBreadcrumbs) {
        $scope.gradeScales = [];
        $scope.schoolList = [];
        $scope.scoreColorList = [];
        $scope.selected = {};
        $scope.selectedList = [];

        $j(() => {
            loadingDialog('Pulling data . . .');
            getGradeScales();
            showBreadcrumbs.showBread();
        });
        
        function getGradeScales() {
            gradeScaleOrg.organizeGradeScalePageData()
                .then(({ gradeScales, schoolList, scoreColorList }) => {
                    $scope.gradeScales = gradeScales;
                    $scope.schoolList = schoolList;
                    $scope.scoreColorList = scoreColorList;
                    console.log($scope.gradeScales);
                    console.log($scope.scoreColorList);
                    console.log($scope.schoolList);
                })
                .catch(error => {
                    console.error('Failed to pull data:', error);
                })
                .finally(() => {
                    closeLoading();
                });
        }

        $scope.updateData = function() {
            loadingDialog('Submitting Changes . . . ');
            gradeScaleOrg.submitChanges($scope.gradeScales)
                .catch(error => {
                    console.error('Failed to submit changes:', error);
                })
                .finally(() => {
                    closeLoading();
                });
        }

        $scope.toggleSchoolSelection = function(scale, school) {
            if (school.selected) {
                if (scale.schools) {
                    if (!scale.schools.includes(school.school_number)) {
                        scale.schools = (scale.schools ? scale.schools + ',' : '') + school.school_number;
                    }
                } else {
                    scale.schools = school.school_number.toString();
                }
            } else {
                // Remove the school from the scale's `schools` list
                scale.schools = scale.schools.split(',')
                    .filter(id => id !== school.school_number.toString())
                    .join(',');
            }
            scale.isdirty = 1;
            console.log(scale);
        }

        $scope.openRecord = function(record) {
            $scope.selectedList = record.scaleItems || [];
            $scope.selected = record;
            
            dataManagement.openLRPDrawer();
            
            console.log($scope.selectedList);
            console.log($scope.selected);
        }
    }]);
});