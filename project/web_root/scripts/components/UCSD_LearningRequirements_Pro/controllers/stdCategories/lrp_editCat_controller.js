'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('EditCategories', ['$scope', 'getData', 'catLogic', 'dataManagement', 'showBreadcrumbs', 
            function($scope, getData, catLogic, dataManagement, showBreadcrumbs) {
        $scope.categories = [];

        $j(() => {
            loadingDialog('Generating Category List');
            getCategoryData();
            showBreadcrumbs.showBread();
        });
        
        function getCategoryData() {
            getData.getCategories()
                .then(response => {
                    $scope.categories = response;
                    console.log($scope.categories);
                })
                .catch(error => {
                    console.error('Failed to pull categories:', error);
                })
                .finally(() => {
                    closeLoading();
                });
        }

        $scope.addNewCategory = function() {
            $scope.categories.push({});
        }

        $scope.deleteCategory = function(record) {
            try {
                record.isdirty = 1;
                [record, $scope.categories] = dataManagement.markForDelete(record, $scope.categories);
            } catch(error) {
                console.error('Failed to mark for delete', error);
            }
        }
        
        $scope.markAsDirty = function(record) {
            record.isdirty = 1;
            console.log(record);
        }

        $scope.updateChanges = function() {
            loadingDialog('Saving New Categories')
            const catChanges = $scope.categories.filter(record => record.isdirty === 1);

            if (catChanges.length > 0) {
                catLogic.organizeCats(catChanges)
                    .then(response => console.log(response))
                    .catch(error => console.error('Failed to update:', error))
                    .finally(() => {
                        alert('Categories Updated!');
                        getCategoryData();
                    });
            } else {
                alert('No Changes to Save!');
                getCategoryData();
            }
        }
    }]);
});