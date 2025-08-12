'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('getData', ($http, $q, dataManagement, classListUrl, stdListUrl, asmtListUrl, commentListUrl,
            studentTestScoresUrl, colorListUrl, stdAssocCatUrl, allStdCatsUrl, scoreColorsUrl, gradeScaleListUrl,
            schoolListUrl, gradescaleitemsUrl, testScoreRulesUrl, uniqueGradesUrl, GSIColorMatchUrl, sortGradeScaleItemsUrl,
            testBandsAllUrl, testWindowsAllUrl, performanceBandsUrl, performanceGroupUrl, getMainGradescalesUrl, getStuAltSchoolsUrl
        ) => {
        const classPath = 'classList.json', 
            stdPath = 'stdList.json', 
            asmtPath = 'asmtList.json', 
            commentPath = 'commentList.json';
        return {
            getAPIData: function(dataSource) {
                return $http(dataSource).then(function successCallback(response) {
                    return response.data;
                },
                function errorCallback(response) {
                    console.error('Status Code:', response.status);
                    //alert('API call failed. Check console log for further details: ' + response.data.message);
                    throw response;
                });
            },
    
            fetchPQ: function(url, args = '') {
                return this.getAPIData({
                    "method": "POST",
                    "url": url,
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    "data": args,
                    "dataType": "json"
                });
            },
            getTList: function(path) {
                return $j.ajax({
                    'method': 'get',
                    'url': path,
                    'dataType': 'json',
                    success: response => {
                        return response;
                    },
                    error: error => {
                        console.error('Error pulling tlist json:', error);
                        throw error;
                    }
                });
            },
            getAllClassData: function(curstudid, curyearid) {
                const args = JSON.stringify({
                    curstudid: curstudid,
                    curyearid: curyearid
                });
                const getClassList = this.fetchPQ(classListUrl, args);
                const getStandardList = this.fetchPQ(stdListUrl, args);
                const getAsmtList = this.fetchPQ(asmtListUrl, args);
                const getComList = this.fetchPQ(commentListUrl, args); // need to add relation to comment_table.sectionsdcid and sections.dcid to prevent bleedover
                
                return $q.all([getClassList, getStandardList, getAsmtList, getComList])
                    .then(([classList, standardList, asmtList, comList]) => {

                        const builtClassData = dataManagement.buildClassList(classList.record, standardList.record, asmtList.record, comList.record);
                        return builtClassData || [];
                    })
                    .catch(error => {
                        throw error;
                    });
            },
            getAllClassDataTlist: function(portalPath, curstudid, curyearid) {
                const args = JSON.stringify({
                    curstudid: curstudid,
                    curyearid: curyearid
                });
                const getClassList = this.getTList(`${portalPath}${classPath}?curstudid=${curstudid}&curyearid=${curyearid}`);
                const getStandardList = this.getTList(`${portalPath}${stdPath}?curstudid=${curstudid}&curyearid=${curyearid}`);
                // const getAsmtList = this.fetchPQ(asmtListUrl, args);
                const getAsmtList = this.getTList(`${portalPath}${asmtPath}?curstudid=${curstudid}&curyearid=${curyearid}`);
                const getComList = this.getTList(`${portalPath}${commentPath}?curstudid=${curstudid}&curyearid=${curyearid}`);

                return $q.all([getClassList, getStandardList, getAsmtList, getComList])
                    .then(([classList, standardList, asmtList, comList]) => {
                        // console.log(standardList);
                        const fClassList = classList.filter(obj => Object.keys(obj).length > 0);
                        const fStdList = standardList.filter(obj => Object.keys(obj).length > 0);
                        const fAsmtList = asmtList.filter(obj => Object.keys(obj).length > 0);
                        const fComList = comList.filter(obj => Object.keys(obj).length > 0);
                        const builtClassData = dataManagement.buildClassList(fClassList, fStdList, fAsmtList, fComList);
                        return builtClassData || [];
                    })
                    .catch(error => {
                        throw error;
                    });
            },
            getStdList: function(curyearid) {
                const args = JSON.stringify({ curyearid: curyearid });
                return this.fetchPQ(stdAssocCatUrl, args)
                    .then(response => response.record || []);
            },
            getCategories: function() {
                return this.fetchPQ(allStdCatsUrl)
                    .then(response => response.record || []);
            },
            getAllStdCatData: function(curyearid) {
                const stdList = this.getStdList(curyearid);
                const categories = this.getCategories();
    
                return $q.all([stdList, categories])
                    .then(([list, cat]) => {
                        return [list || [], cat || []];
                    })
                    .catch(error => {
                        throw error;
                    });
            },
            getColorList: function() {
                return this.fetchPQ(colorListUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getScoreColorList: function() {
                return this.fetchPQ(scoreColorsUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getGradeScales: function() {
                return this.fetchPQ(gradeScaleListUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getGradeScaleItems: function(id) {
                return this.fetchPQ(gradescaleitemsUrl, { gradescaleid: id })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getSchoolList: function() {
                return this.fetchPQ(schoolListUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getTestRules: function() {
                return this.fetchPQ(testScoreRulesUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getUniqueGrades: function() {
                return this.fetchPQ(uniqueGradesUrl)
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getStudentTests: function(curstudid) {
                return this.fetchPQ(studentTestScoresUrl, { curstudid: curstudid })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getColorMatch: function(id) {
                return this.fetchPQ(GSIColorMatchUrl, { colorlistid: id })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getGradeScaleSort: function(schoolid) {
                return this.fetchPQ(sortGradeScaleItemsUrl, { schoolid: schoolid})
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getAllTestBands: function(groupid, testdcid) {
                return this.fetchPQ(testBandsAllUrl, { curgroupid: groupid, curtestdcid: testdcid })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getAllTestWindows: function(groupid, testdcid) {
                return this.fetchPQ(testWindowsAllUrl, { curgroupid: groupid, curtestdcid: testdcid })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getPerformanceBands: function(groupid) {
                return this.fetchPQ(performanceBandsUrl, { curgroupid: groupid })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getPerformanceGroups: function(testdcid) {
                return this.fetchPQ(performanceGroupUrl, { curtestdcid: testdcid })
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getMainGradescales: function(curschoolid) {
                return this.fetchPQ(getMainGradescalesUrl, {curschoolid: curschoolid})
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            },
            getStuAltSchools: function(curstudid) {
                return this.fetchPQ(getStuAltSchoolsUrl, {curstudid: curstudid})
                    .then(response => response.record || [])
                    .catch(error => {
                        throw error;
                    });
            }
        };
    });
});