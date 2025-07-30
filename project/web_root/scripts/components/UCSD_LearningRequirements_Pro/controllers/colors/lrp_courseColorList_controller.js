'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('CourseColorList', ['$q', '$scope', 'getData', 'deleteData', 'colorLogic',
            'showBreadcrumbs', function($q, $scope, getData, deleteData, colorLogic, showBreadcrumbs) {
        $scope.colorList = [];
        
        function courseColors() {
            getData.getColorList()
                .then(response => {
                    $scope.colorList = response || [];
                    console.log($scope.colorList);
                })
                .catch(error => console.error('Failed to pull credits, departments, or their colors:', error))
                .finally(() => closeLoading());
        }
        
        $j(() => {
            loadingDialog('Generating Color List');
            courseColors();
            showBreadcrumbs.showBread();
        });

        $scope.submitChanges = function() {
            loadingDialog('Submitting Changes . . . ');
            // colorLogic.organizeChanges($scope.colorList)
            colorLogic.organizeChanges($scope.colorList)
                .then(response => {
                    console.log(JSON.stringify(response));
                })
                .catch(error => {
                    console.error('Failed to write:', error);
                })
                .finally(() => courseColors());
        }
        
        $scope.deleteAllColors = function() {
            loadingDialog('Deleting all colors');
            const promisesAll = $scope.colorList.map(record => {
                return deleteData.deleteCreditColors(record.id);
            });
            
            $q.all(promisesAll)
                .finally(() => courseColors());
        }
        
        $scope.markDirty = function(record) {
            record.isdirty = 1;
            console.log(record);
        }
        
        $scope.previewColor = function(colorcode) {
            return colorLogic.previewColor(colorcode, '100px');
        }
    }]);
});