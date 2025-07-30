'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.factory('mainViewLogic', ($q, $window, getData, Luxon) => {
        const   testPath = 'testList.json',
                scalePath = 'scaleList.json',
                altSchoolsPath = 'altSchools.json';
        const darkModeMediaQuery = $window.matchMedia('(prefers-color-scheme: dark)');
        const setupListener = (callback) => {
            const listener = (event) => {
                isDarkMode = event.matches;
                if (typeof callback === 'function') {
                    callback(isDarkMode);
                }
            };
            darkModeMediaQuery.addEventListener('change', listener);
    
            return () => {
                darkModeMediaQuery.removeEventListener('change', listener);
            };
        };
                
        let isDarkMode = $window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        function buildGradeScales(gradeScales) {
            const allGradeScalesMap = gradeScales.reduce((map, record) => {
                const key = record.school;
        
                if (!map.has(key)) {
                    map.set(key, {
                        school: record.school,
                        schoolid: record.schoolid,
                        gradeScales: [{ ...record }],
                    });
                } else {
                    map.get(key).gradeScales.push({ ...record });
                }
        
                return map;
            }, new Map());
        
            return Array.from(allGradeScalesMap.values());
        }
        
        function processClassList(classList, initialGS) {
            // Create a map with both colorcode and gsvalue
            const gradeScaleMap = new Map();
            initialGS.forEach(school => 
                school.gradeScales.forEach(gs => 
                    gradeScaleMap.set(`${school.school}:${gs.gsname}`, { color: gs.colorcode, value: parseFloat(gs.gsvalue) })
                )
            );
        
            for (const record of classList) {
                // Initialize counts for missing, late, and incomplete assignments
                record.missingCount = 0;
                record.lateCount = 0;
                record.incompCount = 0;
                let validScores = [];
                const countedAssignments = new Set(); // Track counted assignments by their `asmt`
        
                if (record.standards) {
                    // Loop through each standard in the record
                    for (const category of record.standards) {
                        for (const standard of category.standards) {
                            // Apply color and value to the grades based on the map
                            for (const grade of standard.grades) {
                                const standardColorKey = `${record.class_school}:${grade.score}`;
                                const gradeData = gradeScaleMap.get(standardColorKey);
                                if (gradeData) {
                                    grade.color = gradeData.color || '#CCCCCC'; // Default color (e.g., gray)
                                    grade.value = gradeData.value || null;
                                    if (standard.avg == '1') validScores.push(gradeData.value); // Collect valid scores for average calculation
                                } else {
                                    grade.color = '#CCCCCC'; // Default color if no match
                                    grade.value = null;
                                }
                            }
        
                            // Check if the standard has assignments
                            if (standard.assignments) {
                                // Loop through each assignment in the standard
                                for (const asmt of standard.assignments) {
                                    // Only process the assignment if it hasn't been counted yet
                                    if (!countedAssignments.has(asmt.asmt)) {
                                        countedAssignments.add(asmt.asmt); // Mark the assignment as counted
        
                                        // Apply color to the assignment based on score
                                        
        
                                        // Count missing, late, and incomplete assignments
                                        if (asmt.missing == 1) record.missingCount++;
                                        if (asmt.late == 1) record.lateCount++;
                                        if (asmt.incomplete == 1) record.incompCount++;
                                    }
                                    const asmtColorKey = `${record.class_school}:${asmt.score}`;
                                    const asmtData = gradeScaleMap.get(asmtColorKey);
                                    asmt.color = asmtData ? asmtData.color : '#CCCCCC';
                                }
                            }
                        }
                    }
                }
        
                // Calculate the average color based on valid scores
                if (validScores.length > 0) {
                    const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
                    const schoolGradeScales = initialGS.find(s => s.school === record.class_school)?.gradeScales || [];
                    const nearestGradeScale = schoolGradeScales.reduce((closest, gs) => {
                        const diff = Math.abs(gs.gsvalue - avgScore);
                        return diff < Math.abs(closest.gsvalue - avgScore) ? gs : closest;
                    }, { gsvalue: Infinity });
                    
                    record.avgColor = nearestGradeScale.colorcode;
                    record.avgScore = avgScore;
                } else {
                    record.avgColor = '#CCCCCC'; // Default color (e.g., gray)
                    record.avgScore = null; // No valid scores, so no average
                }
            }
        
            return classList;
        }
        
        return {
            getLearningRequirements: function(curstudid, curyearid, studschoolid) {
                const classPromise = getData.getAllClassData(curstudid, curyearid);
                const testPromise = getData.getStudentTests(curstudid);
                const gradeScalesPromise = getData.getMainGradescales(studschoolid);
                const altSchoolsPromise = getData.getStuAltSchools(curstudid);
    
                return $q.all([classPromise, testPromise, gradeScalesPromise, altSchoolsPromise])
                    .then(([classList, studentTest, gradeScales, altSchools]) => {
                        
                        let initialGS = buildGradeScales(gradeScales);
    
                        const otherSchools = altSchools.filter(
                            school => school.schoolid !== studschoolid
                        );

                        if (otherSchools.length === 0) {
                            const classListFinal = classListFinal = applyGSColors(classList, initialGS);
                            return {
                                classList: classListFinal,
                                studentTest,
                                gradeScales: initialGS
                            };
                        }

                        const altPromises = otherSchools.map(school =>
                            getData.getMainGradescales(school.schoolid)
                                .then(response => buildGradeScales(response))
                                .catch(error => {
                                    console.error(
                                        `Failed to fetch grade scales for school ${school.schoolid}: ${error}`
                                    );
                                    return [];
                                })
                        );
    
                        return $q.all(altPromises).then(altResults => {
                            altResults.forEach(altScale => {
                                initialGS = [...initialGS, ...altScale];
                            });
    
                            return {
                                classList,
                                studentTest,
                                gradeScales: initialGS
                            };
                        });
                    })
                    .catch(error => {
                        console.error(`Failed to pull student data: ${error}`);
                        throw error;
                    });
            },
            getLearningRequirementsTlists: function(portalPath, curstudid, curyearid, studschoolid) {
                const classPromise = getData.getAllClassDataTlist(portalPath, curstudid, curyearid)
                const testPromise = getData.getTList(`${portalPath}${testPath}?curstudid=${curstudid}`);
                const gradeScalesPromise = getData.getTList(`${portalPath}${scalePath}?studschoolid=${studschoolid}`);
                const altSchoolsPromise = getData.getTList(`${portalPath}${altSchoolsPath}?curstudid=${curstudid}&curyearid=${curyearid}`);

                return $q.all([classPromise, testPromise, gradeScalesPromise, altSchoolsPromise])
                    .then(([classList, studentTestDirty, gradeScalesDirty, altSchoolsDirty]) => {
                        const studentTest = studentTestDirty.filter(obj => Object.keys(obj).length > 0);
                        const gradeScales = gradeScalesDirty.filter(obj => Object.keys(obj).length > 0);
                        const altSchools = altSchoolsDirty.filter(obj => Object.keys(obj).length > 0);
                        
                        studentTest.map(record => {
                            const luxonDate = Luxon.DateTime.fromFormat(record.test_date, 'MM/dd/yyyy');

                            if (luxonDate.isValid) {
                                record.isoDate = luxonDate.toISODate();
                                record.accessibleDate = luxonDate.toLocaleString(Luxon.DateTime.DATE_FULL);
                            } else {
                                record.isoDate = '';
                                record.accessibleDate = record.test_date;
                            }
                        
                            return record;
                        });
                        

                        let initialGS = buildGradeScales(gradeScales);

                        const otherSchools = altSchools.filter(
                            school => school.schoolid !== studschoolid
                        );

                        if (otherSchools.length === 0) {
                            const classListFinal = processClassList(classList, initialGS);
                            return {
                                classList: classListFinal,
                                studentTest,
                                gradeScales: initialGS
                            };
                        }

                        const altPromises = otherSchools.map(school =>
                            getData.getTList(`${portalPath}${scalePath}?studschoolid=${school.schoolid}`)
                                .then(response => buildGradeScales(response.filter(obj => Object.keys(obj).length > 0)))
                                .catch(error => {
                                    console.error(
                                        `Failed to fetch grade scales for school ${school.schoolid}: ${error}`
                                    );
                                    return [];
                                })
                        );

                        return $q.all(altPromises)
                            .then(altResults => {
                                altResults.forEach(altScale => {
                                    initialGS = [...initialGS, ...altScale];
                                });
                            })
                            .then(() => {
                                const classListFinal = processClassList(classList, initialGS);
                                return {
                                    classList: classListFinal,
                                    studentTest,
                                    gradeScales: initialGS
                                };
                            });
                    })
                    .catch(error => {
                        console.error(`Failed to pull student data: ${error}`);
                        throw error;
                    });
            },
            setGraphData: function(type, data, darkMode, series1, series2, capName, xName, yName, testscoredcid = null) {
                if (type === 'lrp-test') {
                    const graphDataRaw = data
                            .filter(record => record.testscoredcid === testscoredcid)
                            .reverse();
                
                    const chartPrefs = {
                        "caption": capName || "Historical Test Records",
                        "subCaption": `[${graphDataRaw[0].testname}] ${graphDataRaw[0].testscorename}`,
                        "xAxisname": xName || "Historical Test Windows",
                        "yAxisName": yName || "Score",
                        "theme": darkMode ? "candy" : "fusion"
                    };
                
                    let categories = [];
                    let testScoresData = [];
                    let benchmarkData = [];
                
                    let previousYearid = null;
                
                    // Iterate through the records to build categories, Test Score, and Benchmark data
                    graphDataRaw.forEach((record) => {
                        const yearOffset = parseInt(record.yearid) - 10; // Adjust based on the base year logic
                        const startYear = 2000 + yearOffset; // Base year
                        const endYear = startYear + 1; // Next year
                        const yearLabel = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;
                        const categoryLabel = `${yearLabel}: ${record.windowname}`;
                
                        // Convert the benchmark values to numbers for comparison
                        const benchmarkValue = parseFloat(record.benchmark);
                
                        // Check if the current benchmark is less than the previous one and add a break
                        if (record.split_at_year == '1' && previousYearid !== null && record.yearid > previousYearid) {
                            categories.push({ "label": " " });
                            testScoresData.push({ "value": null });
                            benchmarkData.push({ "value": null });
                        }
                
                        // Add the current category
                        categories.push({ "label": categoryLabel });
                
                        // Add Test Score data
                        testScoresData.push({
                            "value": record.numscore || "0",
                            "color": record.colorcode,
                            "toolText": `${record.testbandname}: ${record.numscore}`
                        });
                
                        // Add Benchmark data
                        benchmarkData.push({ "value": isNaN(benchmarkValue) ? null : benchmarkValue });
    
                        previousYearid = record.yearid;
                    });
                
                    const chartData = {
                        "chart": chartPrefs,
                        "categories": [{ "category": categories }],
                        "dataset": [
                            {
                                "seriesname": series1 || "Test Score",
                                "data": testScoresData
                            },
                            {
                                "seriesname": series2 || "Benchmark",
                                "renderAs": "line",
                                "showValues": "0",
                                "data": benchmarkData
                            }
                        ]
                    };
                
                    // Pass the chartData to FusionCharts
                    return chartData;
                } else if (type === 'lrp-std') {
                    const parsedData = data.filter(item => item.percent !== null && item.percent !== undefined && item.percent !== '') // Filter out items with null or undefined percent
                        .map(item => ({
                            date: new Date(item.due_date),
                            score: item.score,
                            percent: parseFloat(item.percent),
                            label: item.due_date,
                            color: item.color,
                            name: item.asmt || ''
                        }))
                        .sort((a, b) => a.date - b.date);
                    
                    // Step 2: Prepare data for the bar chart (score on Y-axis)
                    const barData = parsedData.map(item => ({
                        value: item.percent,
                        color: item.color,
                        toolText: `${series1 || 'Score'}: ${item.score}`
                    }));
                    
                    // Step 3: Calculate linear regression for the percent data
                    const n = parsedData.length;
                    const xValues = parsedData.map((_, index) => index + 1); // Sequential indices as x values
                    const yValues = parsedData.map(item => item.percent); // Percent as y values
                    
                    const sumX = xValues.reduce((acc, x) => acc + x, 0);
                    const sumY = yValues.reduce((acc, y) => acc + y, 0);
                    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
                    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
                    
                    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;
                    
                    // Step 4: Generate linear regression data points
                    const regressionData = xValues.map(x => ({
                        value: (slope * x + intercept).toFixed(2) // Calculate y = mx + b
                    }));
                    
                    // Step 5: Format chart categories and datasets
                    const categories = [
                        {
                            category: parsedData.map(item => ({
                                label: item.label + '<br>' + item.name // Use the original date as x-axis label
                            }))
                        }
                    ];
                    
                    const trendLineColor = slope > 0 ? '#51b050' : '#cd3d3d'; // Green for positive, Red for negative
                    
                    const dataset = [
                        {
                            seriesname: "",
                            showLabels: 1,
                            data: barData
                        },
                        {
                            seriesname: series2 || "Trend Line",
                            renderas: "line",
                            lineColor: trendLineColor, // Set dynamic line color based on slope
                            data: regressionData
                        }
                    ];
                    
                    // Step 6: Return chart configuration
                    return {
                        categories: categories,
                        dataset: dataset,
                        trendLineColor
                    };
                }
            },
            getDarkMode: () => isDarkMode,
            setupListener,
            filterTestRecords: function(studentTestScores, gradeLevel) {
                const groupedTests = {};
            
                for (const record of studentTestScores) {
                    if (!groupedTests[record.testname]) {
                        groupedTests[record.testname] = [];
                    }
            
                    const testGroup = groupedTests[record.testname];
                    const existingRecord = testGroup.find(r => r.testscoredcid === record.testscoredcid);
                    const testGrade = parseInt(record.test_grade, 10);
                    const studentGradeLevel = parseInt(gradeLevel, 10);
            
                    if (!existingRecord && testGrade >= studentGradeLevel - 2) {
                        testGroup.push(record);
                    } else if (existingRecord) {
                        const existingDate = new Date(existingRecord.test_date);
                        const newDate = new Date(record.test_date);
            
                        if (newDate > existingDate) {
                            const index = testGroup.indexOf(existingRecord);
                            testGroup[index] = record;
                        }
                    }
                }
            
                // Convert grouped tests into a 2-column structure
                const groupedTestsArray = Object.keys(groupedTests).map(testname => ({
                    testname,
                    scorerecords: groupedTests[testname]
                }));
            
                const half = Math.ceil(groupedTestsArray.length / 2);
                return [groupedTestsArray.slice(0, half), groupedTestsArray.slice(half)];
            },
            organizeInsertedContent: function() {
                var buttons = angular.element(document.querySelectorAll('#lrp-inserted-content .lrp-insert-button'));
            
                if (buttons.length > 0) {
                    angular.element('#lrp-inserted-content-buttons').append(buttons);
                }
                // angular.element('#cust-content-footer button').remove();
            },
            getWizardArray: function(translatedTexts) {
                return Object.entries(translatedTexts).map(([key, value]) => {
                    return {
                        text: value || '',
                        image: `/images/css/learning_requirements_pro/images/wizard/${key}.png`
                    };
                });
            }
        };
    });
});