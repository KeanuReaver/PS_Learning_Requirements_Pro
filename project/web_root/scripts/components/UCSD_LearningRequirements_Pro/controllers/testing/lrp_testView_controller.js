'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('TestViewController', ['$scope', '$window', 'getData', 'testLogic', 'showBreadcrumbs',
            function($scope, $window, getData, testLogic, showBreadcrumbs) {
        $scope.testScoreList = [];
        $scope.scoreColorList = [];
        $scope.selectedData = [];
        
        $j(() => {
            loadingDialog('Loading Testscore data . . . ');
            showBreadcrumbs.showBread();
            getData.getScoreColorList()
                .then(response => {
                    $scope.scoreColorList = response;
                })
                .catch(error => console.error('Failed to get colors:', error))
                .finally(() => testRules());
        });
        
        function testRules() {
            testLogic.getTestScoreList()
                .then(response => {
                    $scope.testScoreList = response || [];
                    console.log($scope.testScoreList);
                })
                .catch(error => console.error('Failed to generate test list:', error))
                .finally(() => closeLoading());
        }
        
        $scope.openTestParameters = function(record) {
            $window.open(`/admin/Learning_Requirements_Pro/testPerformanceGroup.html?testdcid=${record.testdcid}&testname=${record.testname}`, '_blank');
        }

        $scope.updateGradeList = function(testscore) {
            testscore.grade_list = testLogic.filterSelectedGrades(testscore);
            testscore.isdirty = 1;
            console.log($scope.testScoreList);
        }

        $scope.submitChanges = function() {
            loadingDialog('Updating changes . . . ');
            testLogic.submitTestViewChanges($scope.testScoreList)
                .then(response => console.log(response))
                .catch(error => console.error('Failed to update records:', error))
                .finally(() => testRules());
        }
        
        $scope.numericSort = function(item) {
            return parseInt(item.name, 10);
        };
        
        $scope.markDirty = record => {
            record.isdirty = 1;
        }
    }]);
});