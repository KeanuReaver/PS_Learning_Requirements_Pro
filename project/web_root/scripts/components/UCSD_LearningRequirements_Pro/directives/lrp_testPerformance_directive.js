'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('lrpTestPerformance', function() {
        return {
            restrict: 'EA',
            scope: {
                performanceBands: '=',
                possibleGrades: '=',
                possibleWindows: '=',
                possibleScores: '=',
                curgroupname: '=',
                curgroupid: '=',
                scoreColorList: '=',
                showTestPerformanceView: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/testPerformance_template.html',
            controller: ['$scope', '$q', '$document', 'writeData', 'testLogic', 'getData', 'dataManagement', 'colorLogic',
                    function($scope, $q, $document, writeData, testLogic, getData, dataManagement, colorLogic) {
                $scope.filterPerformanceBands = [];
                $scope.isGradeDropdownOpen = false;
                $scope.isWindowDropdownOpen = false;
                $scope.isScoreDropdownOpen = false;
                $scope.allScores = true;
                $scope.allWindows = true;
                $scope.allGrades = true;

                function getPerformanceBandData() {
                    getData.getPerformanceBands($scope.curgroupid)
                        .then(response => {
                            const [bands, grades, scores, windows] = testLogic.getPerformanceBands(response, $scope.curgroupid);
                            Object.assign($scope, {
                                performanceBands: bands,
                                possibleGrades: grades,
                                possibleScores: scores,
                                possibleWindows: windows
                            });
                            recheckAll();
                        })
                        .catch(error => console.error('Failed to get performance bands:', error));
                }

                $scope.toggleAll = function(recordArray, toggleValue) {
                    for (const record of recordArray) {
                        record.selected = !toggleValue;
                    }
                    recheckAll();
                }
        
                $scope.checkAllSelected = () => {
                    recheckAll();
                }
                
                $scope.previewColor = (colorcode) => colorLogic.previewColor(colorcode);
        
                function recheckAll() {
                    $scope.allScores = $scope.possibleScores.every(record => record.selected);
                    $scope.allWindows = $scope.possibleWindows.every(record => record.selected);
                    $scope.allGrades = $scope.possibleGrades.every(record => record.selected);
                }
        
                $scope.toggleDropdown = function(type) {
                    if (type === 'grade') {
                        $scope.isGradeDropdownOpen = !$scope.isGradeDropdownOpen;
                        $scope.isWindowDropdownOpen = false;
                        $scope.isScoreDropdownOpen = false;
                    } else if (type === 'window') {
                        $scope.isWindowDropdownOpen = !$scope.isWindowDropdownOpen;
                        $scope.isGradeDropdownOpen = false;
                        $scope.isScoreDropdownOpen = false;
                    } else if (type === 'score') {
                        $scope.isScoreDropdownOpen = !$scope.isScoreDropdownOpen;
                        $scope.isGradeDropdownOpen = false;
                        $scope.isWindowDropdownOpen = false;
                    }
                };
        
                $scope.filterPerformanceBands = function(record) {
                    let selectedGrades = $scope.possibleGrades.filter(item => item.selected).map(item => item.grade_level);
                    let selectedWindows = $scope.possibleWindows.filter(item => item.selected).map(item => item.testwindowid);
                    let selectedScores = $scope.possibleScores.filter(item => item.selected).map(item => item.testscoredcid);
        
                    if (selectedGrades.length === 0 || selectedWindows.length === 0 || selectedScores.length === 0) {
                        return false;
                    }
        
                    let matchesGrade = selectedGrades.includes(record.grade_level);
                    let matchesWindow = selectedWindows.includes(record.testwindowid);
                    let matchesScore = selectedScores.includes(record.testscoredcid);
                    
                    return matchesGrade && matchesWindow && matchesScore;
                };
                
                $scope.copyCurrentToVisible = function (recordToCopy) {
                    const currentBands = recordToCopy.bands.map(band => ({ ...band, isdirty: 1 }));
                    const currentBenchmarks = recordToCopy.benchmarks.map(bench => ({
                        ...bench,
                        isdirty: 1
                    }));

                    for (const record of $scope.performanceBands) {
                        if ($scope.filterPerformanceBands(record)) {
                            record.bands = currentBands.map(band => ({ ...band }));
                            record.benchmarks = currentBenchmarks.map(bench => ({ ...bench }));
                        }
                    }
                }
                
                $scope.updateBandRanges = function(record) {
                    try {
                        $scope.record = testLogic.updateBandRanges(record);
                    } catch (error) {
                        console.error('Error updating band ranges:', error);
                    }
                };
                
                $scope.enforceString = function(value) {
                    if (/^\d+$/.test(value)) {
                        return value.toString();
                    }
                    return '';
                };
                
                const clickOutsideHandler = function (event) {
                    const target = angular.element(event.target);
                    const isClickInsideDropdown = target.closest('.lrp-custom-dropdown').length > 0;
                
                    if (!isClickInsideDropdown) {
                        if (!$scope.$root.$$phase) {
                            $scope.$apply(() => {
                                $scope.isGradeDropdownOpen = false;
                                $scope.isWindowDropdownOpen = false;
                                $scope.isScoreDropdownOpen = false;
                            });
                        } else {
                            $scope.isGradeDropdownOpen = false;
                            $scope.isWindowDropdownOpen = false;
                            $scope.isScoreDropdownOpen = false;
                        }
                    }
                };
        
                $document.on('click', clickOutsideHandler);
        
                $scope.$on('$destroy', function() {
                    $document.off('click', clickOutsideHandler);
                });

                $scope.openUploaderDrawer = () => {
                    dataManagement.openLRPDrawer('60%');
                }
        
                $scope.submitPerformanceBands = function() {
                    loadingDialog('Submitting Changes . . . ');
                    const promises = [];
                    
                    function writePerformanceBands(record) {
                        const args = {
                            groupid: record.groupid,
                            below_benchmark: record.below_benchmark || "0",
                            bottom_band: record.bottom_band || "0",
                            grade_level: record.grade_level,
                            top_band: record.top_band || "0",
                            testbandid: record.testbandid,
                            testwindowid: record.testwindowid
                        }
                        if (record.testbandtype === 'Performance Band') {
                            args.below_benchmark = record.below_benchmark || "0";
                        } else {
                            if (record.testbandname === 'Below Benchmark') {
                                args.below_benchmark = "1";
                            } else {
                                args.below_benchmark = "0";
                            }
                        }
                        
                        if (!record.performance_bandid) args.testscoredcid = record.testscoredcid;
                        return writeData.writePerformance(args, record.performance_bandid)
                    }
        
                    for (const perfGTWGroup of $scope.performanceBands) {
                        for (const benchmark of perfGTWGroup.benchmarks) {
                            if (benchmark.isdirty == 1) {
                                promises.push(writePerformanceBands(benchmark));
                            } else {
                                promises.push(Promise.resolve());
                            }
                            
                        }
                        for (const band of perfGTWGroup.bands) {
                            if (band.isdirty == 1) {
                                promises.push(writePerformanceBands(band));
                            } else {
                                promises.push(Promise.resolve());
                            }
                        }
                    }
                    
                    $q.all(promises)
                        .catch(error => console.error('Failed to write performance bands:', error))
                        .finally(() => {
                            alert('Updated Performance Data!');
                            getPerformanceBandData();
                            closeLoading();
                        });
                }
            }]
        };
    });
});