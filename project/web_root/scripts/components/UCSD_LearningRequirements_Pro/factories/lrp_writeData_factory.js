'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('writeData', (getData, colorsWriteAddr, prefWriteAddr, stdCatWriteAddr, shownTestsWriteAddr, 
            categoriesWriteAddr, gradescaleDescAddr, gradescaleAssignAddr, scoreColorsAddr, gradescaleSortAddr,
            testBandsAddr, performanceBandAddr, testWindowsAddr, performanceGroupAddr
    ) => {
        function writeToTable(path, method, args, parameters = '', orderby = '') {
            const params = orderby !== '' ? `?pagesize=0&order=${orderby}` : '?pagesize=0';
            if (parameters && Object.keys(parameters).length > 0) {
                const urlParams = new URLSearchParams(parameters);
                params += '&' + urlParams.toString();
            }

            const requestData = {
                "method": method,
                "url": path + params,
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }

            if (args && Object.keys(args).length > 0) {
                requestData["data"] = JSON.stringify(args);
            }
            return getData.getAPIData(requestData);
        }

        function payLoad(args, address, id = null) {
            const tablename = address.match(/\/table\/([^/]+)/)[1],
                path = `${address}${id ? `/${id}` : ''}`,
                method = id ? 'PUT' : 'POST',
                payload = {
                    'tables': {
                        [tablename]: args
                    }
                };

            return writeToTable(path, method, payload);
        }

        // Return public functions that use the internal helper functions
        return {
            writeStdCat: function(args, id = null) {
                return payLoad(args, stdCatWriteAddr, id);
            },
            writeCategories: function(args, id = null) {
                return payLoad(args, categoriesWriteAddr, id);
            },
            writeColors: function(args, id = null) {
                return payLoad(args, colorsWriteAddr, id);
            },
            writeScoreColors: function(args, id = null) {
                return payLoad(args, scoreColorsAddr, id);
            },
            writeGradeScaleAssign: function(args, id = null) {
                return payLoad(args, gradescaleAssignAddr, id);
            },
            writeGradeScaleDesc: function(args, id = null) {
                return payLoad(args, gradescaleDescAddr, id);
            },
            writeTestRules: function(args, id = null) {
                return payLoad(args, shownTestsWriteAddr, id);
            },
            writeGSISort: function(args, id = null) {
                return payLoad(args, gradescaleSortAddr, id);
            },
            writeTestBands: function(args, id = null) {
                return payLoad(args, testBandsAddr, id);
            },
            writePerformance: function(args, id = null) {
                return payLoad(args, performanceBandAddr, id);
            },
            writeTestWindows: function(args, id = null) {
                return payLoad(args, testWindowsAddr, id);
            },
            writePerformanceGroup: function(args, id = null) {
                return payLoad(args, performanceGroupAddr, id);
            }
        }
    });
});