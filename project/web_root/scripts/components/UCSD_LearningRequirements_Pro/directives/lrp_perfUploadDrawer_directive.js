'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('lrpPerfUploadDrawer', [function() {
        return {
            restrict: 'EA',
            scope: {
                performanceBands: '=',
                curgroupid: '=',
                curgroupname: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/testUploaderDrawer_template.html',
            controller: ['$scope', '$window', 'dataManagement', 'testLogic',
                    function($scope, $window, dataManagement, testLogic) {
                $scope.parsedData = [];
                $scope.openSection = 1;
                $scope.fieldInfo = [
                    {
                        name: 'performance_bandid',
                        required: true,
                        editable: false,
                        valid_values: '000000',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'groupid',
                        required: true,
                        editable: false,
                        valid_values: '000000',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'testscoredcid',
                        required: true,
                        editable: false,
                        valid_values: '000000',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'testwindowid',
                        required: true,
                        editable: false,
                        valid_values: '0000000',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'testbandid',
                        required: true,
                        editable: false,
                        valid_values: '0000000',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'grade_level',
                        required: true,
                        editable: false,
                        valid_values: '-3 - 13',
                        notes: 'Leave as is from the template'
                    },
                    {
                        name: 'testname',
                        required: false,
                        editable: false,
                        valid_values: '(string)',
                        notes: 'Not required, but no reason to remove'
                    },
                    {
                        name: 'testscorename',
                        required: false,
                        editable: false,
                        valid_values: '(string)',
                        notes: 'Not required, but no reason to remove'
                    },
                    {
                        name: 'testbandtype',
                        required: false,
                        editable: false,
                        valid_values: '(string)',
                        notes: 'Not required, but no reason to remove'
                    },
                    {
                        name: 'bottom_band',
                        required: false,
                        editable: true,
                        valid_values: '(0 - 9999)',
                        notes: 'Denotes the lowest value to associate a test score to this particular row/record. (>=)'
                    },
                    {
                        name: 'top_band',
                        required: false,
                        editable: true,
                        valid_values: '(0 - 9999)',
                        notes: 'Denotes the highest value to associate a test score to this particular row/record. (<)'
                    },
                    {
                        name: 'below_benchmark',
                        required: false,
                        editable: true,
                        valid_values: '0 or 1',
                        notes: 'Denotes whether a record is below the benchmark. Used to calculate benchmark bands. (0 = false, not below benchmark; 1 = true)'
                    }
                ];

                function copyUploadedToLive() {
                    $scope.performanceBands = $scope.performanceBands.map(record => {
                        let isUpdated = false;
                        const updatedBands = $scope.parsedData.filter(item => item.grade_level == record.grade_level 
                                && item.testscoredcid == record.testscoredcid && item.testwindowid == record.testwindowid);
                        if (updatedBands.length > 0) {
                            for (const band of record.bands) {
                                const updatedBand = updatedBands.filter(item => item.testbandid == band.testbandid);
                                if (updatedBand[0]) {
                                    band.bottom_band = updatedBand[0].bottom_band || '';
                                    band.top_band = updatedBand[0].top_band || '';
                                    band.below_benchmark = updatedBand[0].below_benchmark || '0';
                                    isUpdated = true;
                                }
                            }
                        }
                        if (isUpdated) {
                            try {
                                return testLogic.updateBandRanges(record);
                            } catch (error) {
                                console.error('Error updating band ranges:', error);
                            }
                        } else {
                            return record;
                        }
                        
                    })
                    
                    dataManagement.closeLRPDrawer();
                }

                $scope.closeDrawer = () => {
                    dataManagement.closeLRPDrawer();
                }
                
                $scope.toggleSection = function(section) {
                    // If the clicked section is already open, close it
                    if ($scope.openSection === section) {
                        $scope.openSection = null;
                    } else {
                        // Otherwise, open the clicked section
                        $scope.openSection = section;
                    }
                }

                $scope.downloadTSV = function() {
                    const headers = [
                        "performance_bandid",
                        "groupid",
                        "testscoredcid",
                        "testwindowid",
                        "testbandid",
                        "grade_level",
                        "testname",
                        "testscorename",
                        "testbandtype",
                        "testbandname",
                        "bottom_band",
                        "top_band",
                        "below_benchmark"
                    ];
                    const filename = `GroupId_${$scope.curgroupid}_performance_template.tsv`;
                    const tsvContent = dataManagement.generateTSV(headers, $scope.performanceBands);
                
                    dataManagement.downloadFile(tsvContent, filename);
                }

                $scope.processTSV = function() {
                    loadingDialog('Processing file . . . ');

                    dataManagement.processTSV('fileInput')
                        .then(parsedData => {
                            console.log(parsedData);
                            $scope.parsedData = parsedData;
                        })
                        .catch(error => {
                            alert(`Error parsing tsv file: ${error}`);
                            console.error('Error parsing tsv file:', error);
                        })
                        .finally(() => {
                            $scope.$apply();
                            closeLoading();
                        });
                }

                $scope.applyChanges = function() {
                    let confirmation = $window.confirm('Apply changes from uploaded file?');
                    if (confirmation) {
                        copyUploadedToLive();
                    }
                }
            }]
        }
    }]);
});