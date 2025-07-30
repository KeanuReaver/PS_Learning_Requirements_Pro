'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('lrpTestWindows', function() {
        return {
            restrict: 'EA',
            scope: {
                testWindows: '=',
                curgroupid: '=',
                curgroupname: '=',
                curtestdcid: '=',
                showTestWindowView: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/testWindows_template.html',
            controller: ['$scope', '$q', 'dataManagement', 'deleteData', 'writeData', 'testLogic', 'testWindowsAddr',
                    function($scope, $q, dataManagement, deleteData, writeData, testLogic, testWindowsAddr) {
                $scope.markWindowForDelete = function(record) {
                    try {
                        [record, $scope.testWindows] = dataManagement.markForDelete(record, $scope.testWindows);
                    } catch(error) {
                        console.error('Failed to mark for delete', error);
                    }
                }
                $scope.sortableWindowOptions = {
                    handle: '.lrpHandle',
                    stop: function() {
                        $scope.testWindows.forEach((record, index) => {
                            record.sortorder = index.toString();
                            record.isdirty = 1;
                        });
                    }
                }
                
                $scope.addTestWindow = () => {
                    const newWindow = {
                        groupid: $scope.curgroupid,
                        testdcid: $scope.curtestdcid,
                        sortorder: $scope.testWindows.length.toString(),
                        window_end_day: '01',
                        window_start_day: '01'
                    }
                    $scope.testWindows.push(newWindow);
                }

                function getTestWindows() {
                    testLogic.getTestWindows($scope.curgroupid, $scope.curtestdcid)
                        .then(response => {
                            $scope.testWindows = response || [];
                        })
                        .catch(error => console.error('Failed to get windows:', error));
                }
                
                $scope.updateWindows = function() {
                    loadingDialog('Updating Windows . . . ');
                    const promises = $scope.testWindows.map(record => {
                        if (record.deleteRecord == 1) {
                            return deleteData.deleteRecord(testWindowsAddr, record.id);
                        } else if (record.isdirty == 1) {
                            const args = {
                                groupid: record.groupid,
                                windowname: record.windowname,
                                window_start: `${record.window_start_month}-${record.window_start_day}`,
                                window_end: `${record.window_end_month}-${record.window_end_day}`,
                                sortorder: record.sortorder.toString()
                            }
        
                            if (!record.id) args.testdcid = record.testdcid;
                            return writeData.writeTestWindows(args, record.id);
                        } else {
                            return Promise.resolve();
                        }
                    });
        
                    $q.all(promises)
                        .catch(error => console.error('Failed to update windows:', error))
                        .finally(() => {
                            getTestWindows();
                            closeLoading();
                        });
                }
            }]
        };
    });
});