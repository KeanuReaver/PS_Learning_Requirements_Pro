'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('testLogic', ($q, getData, writeData, deleteData) => {
        function reduceByName(tests, uniqueGrades, testbands, testwindows) {
            const testGroups = [];
            
            for (const item of tests) {
                const testName = item.test_name;
                let testGroup = testGroups.find(group => group.testname === testName);
                const bands = testbands.filter(record => record.testdcid === item.testdcid);
                const finalBands = bands.length > 0 ? bands : [
                    {
                        bandtype: 'Benchmark',
                        testdcid: item.testdcid,
                        testbandname: 'Below Benchmark'
                    },
                    {
                        bandtype: 'Benchmark',
                        testdcid: item.testdcid,
                        testbandname: 'At/Above Benchmark'
                    }
                ];
        
                if (!testGroup) {
                    testGroup = {
                        testname: testName,
                        testdcid: item.testdcid,
                        scores: [],
                        testbands: finalBands,
                        testwindows: testwindows.filter(record => record.testdcid = item.testdcid)
                    };
                    testGroups.push(testGroup);
                }
        
                // Create a clone of the gradesMap for the current item's possible grades
                const gradesMap = uniqueGrades.map(grade => ({
                    name: grade.grade_level,
                    selected: false
                }));
        
                // Split grade_list and set selected to true if there's a match in possible_grades
                const gradeList = item.grade_list ? item.grade_list.split(',') : [];
                for (const gradeName of gradeList) {
                    const matchingGrade = gradesMap.find(grade => grade.name === gradeName.trim());
                    if (matchingGrade) {
                        matchingGrade.selected = true;
                    }
                }
        
                // Add item to scores with its specific possible_grades
                testGroup.scores.push({
                    ...item,
                    possible_grades: gradesMap
                });
            }
        
            return testGroups;
        }
        
        function filterDirty(testList) {
            return testList.map(testScore => {
                    const dirtyScores = testScore.scores.filter(score => score.isdirty == 1);
                    
                    if (dirtyScores.length > 0) {
                        return {
                            ...testScore,
                            scores: dirtyScores
                        }
                    }
                    return null;
                })
                .filter(testScore => testScore !== null);
        }
        
        function writeTestRuleChanges(score) {
            const args = {
                grade_list: score.grade_list || '',
                shownum: score.shownum === '1' ? '1' : '0',
                showpercent: score.showpercent === '1' ? '1' : '0',
                showalpha: score.showalpha === '1' ? '1' : '0'
            };
            
            let id = null;
    
            if (score.existing === 'Existing') {
                id = score.testscore_dcid;
            } else {
                args.testscoredcid = score.testscore_dcid;
            }

            return writeData.writeTestRules(args, id);
        }

        return {
            filterSelectedGrades: function(testscore) {
                return testscore.possible_grades
                    .filter(grade => grade.selected)
                    .map(grade => grade.name)
                    .join(',');
            },
            getTestScoreList: function() {
                const testScoreListPromise = getData.getTestRules();
                const uniqueGradesPromise = getData.getUniqueGrades();
                const testBandsPromise = getData.getAllTestBands();
                const testWindowsPromise = getData.getAllTestWindows();

                return $q.all([testScoreListPromise, uniqueGradesPromise, testBandsPromise, testWindowsPromise])
                    .then(([testScores, uniqueGrades, testBands, testWindows]) => {
                        return reduceByName(testScores, uniqueGrades, testBands, testWindows);
                    })
                    .catch(error => {
                        throw error;
                    });
            },
            submitTestViewChanges: function(testList) {
                const promises = [];
                const filteredRecords = filterDirty(testList);
                
                if (!filteredRecords.length) return $q.resolve();
                for (const test of filteredRecords) {
                    for (const score of test.scores) {
                        promises.push(writeTestRuleChanges(score));
                    }
                }

                return $q.all(promises);
            },
            submitTestBands: function(bands) {
                const promises = bands.map(record => {
                    if (record.deleteRecord == 1) {
// Delete associated records in performance bands then:
                        getData.getPerformanceBands(record)                       
                    }
                })
            },
            getPerformanceBands: function(data, curgroupid) {
                const organizedMap = new Map();
                const possibleGrades = [];
                const possibleScores = [];
                const possibleWindows = [];

                for (const record of data) {
                    if (!record.groupid) record.groupid = curgroupid;
                    
                    if (!possibleGrades.find(item => item.grade_level === record.grade_level)) {
                        possibleGrades.push({ grade_level: record.grade_level, selected: true });
                    }
                    
                    if (!possibleScores.find(item => item.testscoredcid === record.testscoredcid)) {
                        possibleScores.push({ testscoredcid: record.testscoredcid, testscorename: record.testscorename, selected: true });
                    }
                    
                    if (!possibleWindows.find(item => item.testwindowid === record.testwindowid)) {
                        possibleWindows.push({ testwindowid: record.testwindowid, testwindowname: record.testwindowname, selected: true });
                    }

                    const key = `${record.grade_level}-${record.testscoredcid}-${record.testwindowid}`;

                    if (!organizedMap.has(key)) {
                        const newRecord = {
                            testdcid: record.testdcid,
                            testname: record.testname,
                            testscoredcid: record.testscoredcid,
                            testscorename: record.testscorename,
                            testwindowid: record.testwindowid,
                            testwindowname: record.testwindowname,
                            groupid: record.groupid,
                            grade_level: record.grade_level,
                            benchmarks: [],
                            bands: []
                        };

                        if (record.testbandtype === 'Performance Band') {
                            newRecord.bands.push({ ...record });
                        } else {
                            newRecord.benchmarks.push({ ...record });
                        }

                        organizedMap.set(key, newRecord);
                    } else {
                        const existingRecord = organizedMap.get(key);
                        if (record.testbandtype === 'Performance Band') {
                            existingRecord.bands.push({ ...record });
                        } else {
                            existingRecord.benchmarks.push({ ...record });
                        }
                    }
                }

                return [
                    Array.from(organizedMap.values()).map(record => {
                        if (record.bands) {
                            record.bands.sort((a, b) => a - b);
                        }
                        return record;
                    }), 
                    possibleGrades, 
                    possibleScores, 
                    possibleWindows
                ];
            },
            getTestBandAndBenchmarks: function(curgroupid, curtestdcid) {
                return getData.getAllTestBands(curgroupid, curtestdcid)
                    .then(response => {
                        let testBenchmarks = response.filter(record => record.bandtype === 'Benchmark') || [];
                        let testBands = response.filter(record => record.bandtype === 'Performance Band') || [];
                        if (testBenchmarks.length !== 2) {
                            testBenchmarks = [
                                {
                                    groupid: curgroupid,
                                    testdcid: curtestdcid,
                                    bandtype: 'Benchmark',
                                    testbandname: 'Below Benchmark',
                                    sortorder: 0,
                                    isdirty: 1
                                },
                                {
                                    groupid: curgroupid,
                                    testdcid: curtestdcid,
                                    bandtype: 'Benchmark',
                                    testbandname: 'At/Above Benchmark',
                                    sortorder: 1,
                                    isdirty: 1
                                }
                            ]
                        }
                        return [testBands, testBenchmarks];
                        
                    })
                    .catch(error => console.error('Failed to get testBands:', error));
            },
            getTestWindows: function(curgroupid, curtestdcid) {
                return getData.getAllTestWindows(curgroupid, curtestdcid)
                    .then(response => {
                        for (const record of response) {
                            if (!!record.window_start) {
                                const split_start = record.window_start.split('-');
                                record.window_start_month = split_start[0];
                                record.window_start_day = split_start[1];
                            }

                            if (!!record.window_end) {
                                const split_end = record.window_end.split('-');
                                record.window_end_month = split_end[0];
                                record.window_end_day = split_end[1];
                            }   
                        }
                        return response;
                    });
            },
            updateBandRanges: function(record) {
                if (!record || !record.bands || !record.benchmarks) {
                    throw new Error("Invalid record format");
                }
            
                const bands = record.bands;
                const bottomBench = record.benchmarks.find(b => b.testbandname === 'Below Benchmark');
                const topBench = record.benchmarks.find(b => b.testbandname === 'At/Above Benchmark');
            
                let belowBenchmark = '0';
            
                for (let i = 0; i < bands.length; i++) {
                    if (bands[i].below_benchmark === '1' && parseInt(bands[i].top_band, 10) > parseInt(belowBenchmark, 10)) {
                        belowBenchmark = bands[i].top_band;
                    }
            
                    if (bands[i].top_band && bands[i + 1]) {
                        bands[i + 1].bottom_band = bands[i].top_band;
                        bands[i + 1].isdirty = 1;
                    }
                }

                if (bottomBench) {
                    bottomBench.bottom_band = '0';
                    bottomBench.top_band = belowBenchmark;
                    bottomBench.isdirty = 1;
                }
            
                if (topBench) {
                    topBench.bottom_band = belowBenchmark;
                    topBench.top_band = '9999';
                    topBench.isdirty = 1;
                }

                return record;
            }
        }
    });
});