'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('ScoreColorListController', ['$scope', 'getData', 'colorLogic', 'dataManagement', 'showBreadcrumbs',
            function($scope, getData, colorLogic, dataManagement, showBreadcrumbs) {
        $scope.scoreColors = [];
        
        $j(() => {
            loadingDialog('Loading Colors');
            console.log('this loaded');
            getData.getScoreColorList()
                .then(response => {
                    $scope.scoreColors = response;
                    showBreadcrumbs.showBread();
                })
                .catch(error => console.error('Failed to load score color list:', error))
                .finally(() => closeLoading());
        });

        $scope.previewColor = function(colorcode) {
            return colorLogic.previewColor(colorcode);
        }

        $scope.warnBadColorCode = (colorcode) => {
            return colorLogic.isValidColor(colorcode);
        }

        $scope.deleteColor = function(record) {
            try {
                [record, $scope.scoreColors] = dataManagement.markForDelete(record, $scope.scoreColors);
            } catch(error) {
                console.error('Failed to mark for delete', error);
            }
            console.log(record);
        }

        $scope.addNewColor = () => {
            $scope.scoreColors.push({});
        }

        $scope.submitChanges = function() {
            loadingDialog('Processing . . . ');
            // console.log($scope.scoreColors);
            colorLogic.processScoreColors($scope.scoreColors)
                .then(response => {
                    console.log(response);
                    getData.getScoreColorList()
                        .then(response => {
                            $scope.scoreColors = response;
                            alert('Successfully updated score colors!');
                        });
                    
                })
                .catch(error => console.error('Failed to update score color list:', error))
                .finally(() => closeLoading());
        }     
    }]);
});