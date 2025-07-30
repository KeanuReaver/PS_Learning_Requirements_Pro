'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.factory('dataManagement', (getTrend, $document) => {
        function associateStandards(classItem, stdList, asmtList) {
            classItem.standards = []; 
            const stdMatches = stdList.filter(stdItem => stdItem.course_name === classItem.course_name);

            if (stdMatches.length > 0) {
                stdMatches.forEach(stdMatch => {
                    stdMatch = attachAssignmentsToStandard(stdMatch, asmtList, classItem.course_name);
                    classItem.standards.push(stdMatch);
                });
            }
            // console.log(classItem);
            return classItem;
        }
        
        function collapseStandards(stdList) {
            const groupedByCourseAndCategory = {};
        
            // Group standards by course_name and category
            for (const stdItem of stdList) {
                const courseName = stdItem.course_name.trim(); // Trim course_name for consistency
                const category = stdItem.category;
                const key = `${courseName}|${category}`;
        
                if (!groupedByCourseAndCategory[key]) {
                    // Initialize a new group for the category within the course
                    groupedByCourseAndCategory[key] = {
                        category: category,
                        catstyle: stdItem.catstyle || "",
                        course_name: courseName,
                        avg: stdItem.avg || 0,
                        standards: [] // Initialize standards array
                    };
                }
        
                // Group standards by standardIdentifier within each category
                const categoryGroup = groupedByCourseAndCategory[key];
                const standardKey = `${courseName}|${stdItem.standardIdentifier}`;
        
                let existingStandard = categoryGroup.standards.find(
                    std => std.standardIdentifier === stdItem.standardIdentifier
                );
        
                if (!existingStandard) {
                    // Initialize a new standard in the group
                    existingStandard = {
                        category: stdItem.category,
                        catstyle: stdItem.catstyle || "",
                        avg: stdItem.avg || 0,
                        course_name: courseName,
                        description: stdItem.description,
                        standardIdentifier: stdItem.standardIdentifier,
                        standardName: stdItem.standardName,
                        grades: [] // Initialize grades array
                    };
                    categoryGroup.standards.push(existingStandard);
                }
        
                // Add the `storecode` and `score` to the grades array
                if (stdItem.storecode) {
                    existingStandard.grades.push({
                        storecode: stdItem.storecode,
                        score: stdItem.score || "--",
                        color: stdItem.color,
                    });
                }
            }
        
            // Convert grouped categories and standards back to an array
            return Object.values(groupedByCourseAndCategory);
        }
        
        function attachAssignmentsToStandard(category, asmtList, courseName) {
            category.standards.forEach(stdMatch => {
                // Find assignments that match the standardidentifier and course name
                const asmtMatches = asmtList.filter(asmtItem =>
                    asmtItem.standardIdentifier == stdMatch.standardIdentifier &&
                    asmtItem.course_name.trim() == courseName.trim()
                );
    
                // Sort the matching assignments by due_date in descending order
                asmtMatches.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
    
                // If there are matches, calculate the trend and attach assignments
                if (asmtMatches.length > 0) {
                    if (asmtMatches.length > 1) {
                        let trend = Math.round(getTrend.calculateLinearRegression(asmtMatches)) / 100;
                        if (trend > 1) {
                            trend = 1;
                        } else if (trend < -1) {
                            trend = -1;
                        }
                        
                        stdMatch.trend = trend;
                        
                    } else {
                        stdMatch.trend = 0;
                    }
                    stdMatch.assignments = asmtMatches;
                } else {
                    // No matches found; ensure `trend` and `assignments` are cleared
                    stdMatch.trend = 0;
                    stdMatch.assignments = [];
                }
            });
            // console.log(category);
            
            return category;
        }
        
        function associateComments(classItem, comList) {
            if (comList) {
                let comMatch = comList.find(comItem => comItem.course_name === classItem.course_name);
                
                if (comMatch) {
                    if (!Array.isArray(comMatch)) {
                        comMatch = [comMatch];
                    }
                    classItem.comment = comMatch;
                }
            }

            return classItem;
        }
        
        return {
            buildClassList: function(classList, stdList, asmtList, comList) {
                const classList_clean = this.smashClasses(classList);
                const standards_clean = collapseStandards(stdList);
                return classList_clean.map(classItem => {
                    classItem = associateStandards(classItem, standards_clean, asmtList);
                    classItem = associateComments(classItem, comList);
                    classItem.avg = (classItem.standards && classItem.standards.filter(item => item.avg == '1').length > 0)
                        ? '1'
                        : '0';
                    
                    return classItem;
                });
            },
            smashClasses: function(data) {
                const grouped = {};
                data.forEach(item => {
                    const courseName = item.course_name.trim();
        
                    if (grouped[courseName]) {
                        grouped[courseName].suppress = Math.min(parseInt(grouped[courseName].suppress, 10), parseInt(item.suppress, 10));
                        grouped[courseName].iscurrent = Math.max(parseInt(grouped[courseName].iscurrent, 10), parseInt(item.iscurrent, 10));
                        if (!grouped[courseName].period) grouped[courseName].period = item.period;
                    } else {
                        grouped[courseName] = {
                            course_name: courseName,
                            suppress: parseInt(item.suppress),
                            grades: [],
                            sched_department: item.sched_department,
                            iscurrent: parseInt(item.iscurrent),
                            period: item.period,
                            section_description: item.section_description,
                            class_school: item.class_school,
                            colorcode: item.colorcode,
                            comexpanded: true
                        };
                    }
                    
                    if (item.storecode) {
                        grouped[courseName].grades.push({
                            storecode: item.storecode,
                            grade: item.class_grade
                        });
                    }
                    
                });
                return Object.values(grouped);
            },  
            
            markForDelete: function(record, recordList) {
                if (!record.id && !record.dcid) {
                    const index = recordList.indexOf(record);
                    if (index !== -1) {
                        recordList.splice(index, 1);
                    }
                } else if (!!record) { // If record does exist and has an ID
                    record.deleteRecord = record.deleteRecord === 1 ? 0 : 1;
                }
                
                return [record, recordList];
            },
            openLRPDrawer: function(width = '40%') {
                $j('#lrp-overlay').fadeIn();
                $j('#lrp-drawer').animate({ width: width, minWidth: '550px' }, 500);
                $j('body').css('overflow-y', 'hidden');
            },
            closeLRPDrawer: function() {
                $j('#lrp-overlay').fadeOut();
                $j(`#lrp-drawer`).animate({ width: '0', minWidth: '0' }, 500);
                $j('body').css('overflow-y', 'auto');
            },
            generateTSV: function(headers, records) {
                let tsvContent = headers.join('\t') + '\n';
                for (const record of records) {
                    for (const item of record.bands) {
                        const row = headers.map(column => {
                            return (item[column] || '').trim().replace(/[\n\r\t]+/g, ' ');
                        }).join('\t');
                        tsvContent += row + '\n';
                    }
                }
                return tsvContent;
            },
            downloadFile: function(content, filename) {
                const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;'});
                const link = $document[0].createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    $document[0].body.appendChild(link);
                    link.click();
                    $document[0].body.removeChild(link);
                }
            },
            parseTSVToJSON: function(tsvString) {
                const normalizedTSV = tsvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = normalizedTSV.trim().split('\n');

                if (lines.length < 1) {
                    throw new Error("TSV string is empty or malformed.");
                }
                const headers = lines[0].split('\t');

                // map remaining lines to json and returns json file.
                return lines.slice(1).map(line => {
                    const values = line.split('\t');
                    return headers.reduce((acc, header, index) => {
                        acc[header.trim()] = (values[index] || '').trim();
                        return acc;
                    }, {});
                });
            },
            processTSV: function(fileInputId) {
                const fileInput = $document[0].getElementById(fileInputId); 

                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    return Promise.reject(new Error('Please select a TSV file.'));
                }

                const file = fileInput.files[0];
                const reader = new FileReader();
                const self = this;

                return new Promise((resolve, reject) => {
                    reader.onload = function(e) {
                        try {
                            const tsvData = e.target.result;
                            const parsedData = self.parseTSVToJSON(tsvData); 
                            resolve(parsedData);
                        } catch (error) {
                            reject(error);
                        }
                    };

                    reader.onerror = function() {
                        reject(new Error('Error reading the file.'));
                    };

                    reader.readAsText(file);
                });
            }
        };
    });
});