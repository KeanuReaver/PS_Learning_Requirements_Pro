'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('lrpTestBands', function() {
        return {
            restrict: 'EA',
            scope: {
                testBands: '=',
                testBenchmarks: '=',
                showTestBandView: '=',
                curtestdcid: '=',
                curgroupname: '=',
                curgroupid: '=',
                scoreColorList: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/testBands_template.html',
            controller: ['$scope', '$q', 'dataManagement', 'deleteData', 'writeData', 'testLogic',
                    function($scope, $q, dataManagement, deleteData, writeData, testLogic) {
                $scope.addTestBand = function() {
                    const newBand = {
                        testdcid: $scope.curtestdcid,
                        groupid: $scope.curgroupid,
                        bandtype: 'Performance Band',
                        isdirty: 1,
                        sortorder: $scope.testBands.length + 2
                    }
                    
                    $scope.testBands.push(newBand);
                }
                
                $scope.sortableOptions = {
                    handle: '.lrpHandle',
                    stop: function() {
                        $scope.testBands.forEach((record, index) => {
                            record.sortorder = index + 2;
                            record.isdirty = 1;
                        });
                        console.log($scope.testBands);
                    }
                }
                
                $scope.markForDelete = function(record) {
                    try {
                        [record, $scope.testBands] = dataManagement.markForDelete(record, $scope.testBands);
                    } catch(error) {
                        console.error('Failed to mark for delete', error);
                    }
                    console.log(record);
                }
                
                function getTestBands() {
                    testLogic.getTestBandAndBenchmarks($scope.curgroupid, $scope.curtestdcid)
                        .then(response => {
                            [$scope.testBands, $scope.testBenchmarks] = response;
                        })
                        .catch(error => console.error('Failed to get testBands and/or testBenchmarks:', error));
                }
                
                $scope.updateBands = function() {
                    loadingDialog('Processing . . . ');
                    const testBands = [...$scope.testBenchmarks, ...$scope.testBands];
                    console.log(testBands);
                    const promises = testBands.map(record => {
                        console.log('this ran');
                        if (record.deleteRecord == 1) {
                            return deleteData.deleteTestBand(record.id)
                                .catch(error => {
                                    throw error;
                                });
                        } else if (record.isdirty == 1) {
                            const args = {
                                name: record.testbandname,
                                bandtype: record.bandtype,
                                groupid: record.groupid,
                                lrp_color_list_id: record.colorlistid,
                                sortorder: record.sortorder.toString()
                            };
        
                            if (!record.id) args.testdcid = record.testdcid;
        
                            return writeData.writeTestBands(args, record.id)
                                .catch(error => {
                                    throw error;
                                });
                        } else {
                            return Promise.resolve();
                        }    
                    });
        
                    $q.all(promises)
                        .catch(error => console.error('Failed to write band:', error))
                        .finally(() => {
                            getTestBands();
                            closeLoading();
                            alert('Saved Changes to Test Bands!');
                        });
                }
            }]
        };
    });
});