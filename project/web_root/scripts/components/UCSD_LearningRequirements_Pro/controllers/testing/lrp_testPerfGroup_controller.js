'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('PerformanceGroups', ['$q', '$scope', 'getData', 'writeData', 'testLogic', 'showBreadcrumbs',
            function($q, $scope, getData, writeData, testLogic, showBreadcrumbs) {
        $scope.curtestdcid; // init value
        $scope.curtestname; // init value
        $scope.performanceGroups = [];
        $scope.curgroupid;
        $scope.curgroupname;
        $scope.showTestBandView = false;
        $scope.showTestWindowView = false;
        $scope.showTestPerformanceView = false;
        $scope.scoreColorList = [];
        $scope.testBands = [];
        $scope.testBenchmarks = [];
        $scope.testWindows = [];
        $scope.performanceBands = [];
        $scope.possibleGrades = [];
        $scope.possibleWindows = [];
        $scope.possibleScores = [];
        
        $j(() => {
            getPerformanceGroups();
            showBreadcrumbs.showBread();
        });

        function getPerformanceGroups() {
            const groupPromise = getData.getPerformanceGroups($scope.curtestdcid);
            const scorePromise = getData.getScoreColorList();
            
            $q.all([groupPromise, scorePromise])
                .then(([groups, scoreColors]) => {
                    $scope.performanceGroups = groups;
                    $scope.scoreColorList = scoreColors;
                    $scope.curgroupid = groups.filter(record => record.isdefault == 1)[0].id;
                    
                })
                .catch(error => console.error('Failed to get test groups or scoreColors:', error));
        }
        
        function getTestBands() {
            testLogic.getTestBandAndBenchmarks($scope.curgroupid, $scope.curtestdcid)
                .then(response => {
                    [$scope.testBands, $scope.testBenchmarks] = response;
                })
                .catch(error => console.error('Failed to get testBands and/or testBenchmarks:', error));
        }
        
        function getPerformanceBandData() {
            getData.getPerformanceBands($scope.curgroupid)
                .then(response => {
                    [$scope.performanceBands, $scope.possibleGrades, $scope.possibleScores, $scope.possibleWindows] =
                        testLogic.getPerformanceBands(response, $scope.curgroupid);
        
                    for (const band of $scope.performanceBands) {
                        band.has_value = false;
        
                        if (band.benchmarks && Array.isArray(band.benchmarks)) {
                            band.has_value = band.benchmarks.some(benchmark => {
                                return (
                                    (benchmark.bottom_band && !isNaN(parseInt(benchmark.bottom_band))) ||
                                    (benchmark.top_band && !isNaN(parseInt(benchmark.top_band)))
                                );
                            });
                        }
                    }
        
                    console.log($scope.performanceBands);
                })
                .catch(error => console.error('Failed to get performance bands:', error));
        }
        
        $scope.markDirty = (record) => {
            record.isdirty = 1;
        }
        
        function getTestWindows() {
            testLogic.getTestWindows($scope.curgroupid, $scope.curtestdcid)
                .then(response => {
                    $scope.testWindows = response || [];
                })
                .catch(error => console.error('Failed to get windows:', error));
        }

        $scope.addNewPerformanceGroup = function() {
            const newRecord = {
                testdcid: $scope.curtestdcid,
                isdirty: 1,
                isdefault: ($scope.performanceGroups.length > 0) ? '0' : '1',
                split_at_year: '0'
            }
            $scope.performanceGroups.push(newRecord);
        }

        $scope.autoDefault = function() {
            return !($scope.performanceGroup.length > 0)
        }

        $scope.updateDefault = function(record) {
            for (const record of $scope.performanceGroups) {
                record.isdefault = '0';
                record.isdirty = '1';
            }
            record.isdefault = '1';
            record.isdirty = '1';
        }

        $scope.openContent = function(pageName, record) {
            $scope.testbands = [];
            $scope.testwindows = [];
            $scope.curgroupid = record.id;
            $scope.curgroupname = record.groupname;
            
            if (pageName === 'testBands') {
                $scope.showTestBandView = !$scope.showTestBandView;
                $scope.showTestWindowView = false;
                $scope.showTestPerformanceView = false;
                getTestBands();
            } else if (pageName === 'testWindows') {
                $scope.showTestWindowView = !$scope.showTestWindowView;
                $scope.showTestBandView = false;
                $scope.showTestPerformanceView = false;
                getTestWindows();
            } else if (pageName === 'testPerformance') {
                $scope.showTestPerformanceView = !$scope.showTestPerformanceView;
                $scope.showTestBandView = false;
                $scope.showTestWindowView = false;
                getPerformanceBandData();
            }
        }

        $scope.checkBandWindow = (a, b) => {
            return !(parseInt(a, 10) > 0 && parseInt(b, 10) > 0);
        }

        $scope.submitChanges = function() {
            loadingDialog('Saving changes . . . ');
            const promises = $scope.performanceGroups.map(record => {
                if (record.isdirty == 1) {
                    const args = {
                        name: record.groupname,
                        isdefault: record.isdefault == 1 ? '1' : '0',
                        split_at_year: record.split_at_year || '0' 
                    };
                    if (!record.id) args.testdcid = record.testdcid;

                    return writeData.writePerformanceGroup(args, record.id);
                } else {
                    return Promise.resolve();
                }
            });

            $q.all(promises)
                .then(() => alert('Saved Changes'))
                .catch(error => console.error('Failed to save changes:', error))
                .finally(() => {
                    closeLoading();
                    getPerformanceGroups();
                });
        }
    }]);
});