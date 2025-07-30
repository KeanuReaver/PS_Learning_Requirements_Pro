"use strict";
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('StdListController', ['$q', '$scope', '$timeout', 'getData', 'showBreadcrumbs', 'writeData',
            function($q, $scope, $timeout, getData, showBreadcrumbs, writeData) {
        $scope.curyearid; // init value

        $scope.listStandards = [];
        $scope.categories = [];
        $scope.allSelectedCategory = "";

        
        $j(() => {
            loadingDialog('Pulling Standard List');
            getAllStandards();
            showBreadcrumbs.showBread();
        });
        
        function getAllStandards() {
            getData.getAllStdCatData($scope.curyearid)
                .then(([resp1, resp2]) => {
                    $scope.listStandards = resp1;
                    $scope.categories = resp2;
                })
                .catch(error => console.error('Failed to load standards or categories:', error))
                .finally(() => closeLoading());
        }

        $scope.updateRecord = record => {
            return record.dirty = 1;
        }

        $scope.submitChanges = function() {
            loadingDialog('Updating Changes . . . ');
            const recordsToUpdate = $scope.listStandards.filter(record => record.dirty === 1);
        
            const promises = recordsToUpdate.map(record => {
                const args = {
                    category: record.catid || ''
                };
                if (!record.stdcatid) args.standardstandardid = record.standardid;
    
                return writeData.writeStdCat(args, record.stdcatid)
                    .then(response => {
                        console.log('Write success:', response);
                        return response;
                    })
                    .catch(error => {
                        console.error('Error writing record:', error);
                        throw error; // Ensure errors are propagated
                    });
            });
    
            $q.all(promises)
                .catch(error => {
                    console.error('Failed to write one or more records:', error);
                })
                .finally(() => {
                    alert('Finished updating');
                    getAllStandards();
                });

        };

        // Controls the mass set category functionality
        $scope.applyCategoryToVisible = function() {
            const selectedCategory = $scope.allSelectedCategory;
            const selectedStandards = $j('[data-ng-repeat="standard in listStandards"]');
            console.log(selectedCategory);
            console.log(selectedStandards);
            if (!selectedCategory) return; // Do nothing if no category is selected

            // Show confirmation alert
            if (confirm("Do you want to set all visible standards to this category?")) {
                // Iterate over visible rows
                selectedStandards.each(function(index, rowElement) {
                    const $rowElement = $j(rowElement);
                    if ($rowElement.is(':visible')) {
                        const standard = $scope.listStandards[index];
                        standard.catid = selectedCategory;
                        $scope.updateRecord(standard); // Mark the row as dirty
                    }
                });
                console.log($scope.listStandards);
            }

            // Reset dropdown to default value
            $scope.allSelectedCategory = "";
        }
    }]);
});