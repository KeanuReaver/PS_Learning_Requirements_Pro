'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('deleteData', ($http, scoreColorsAddr, gradescaleDescAddr, colorsWriteAddr, testBandsAddr) => {
        return {
            deleteRecord: function(path, id) {
                const deletepath = path.endsWith('/') ? path + id : `${path}/${id}`;
            
                console.log(deletepath);
                return $http({
                    "url": deletepath,
                    "method": "DELETE",
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
                .catch(error => {
                    console.error('failed to delete:', error);
                    throw error;
                });
            },
            deleteScoreColor: function(id) {
                return this.deleteRecord(scoreColorsAddr, id);
            },
            deleteColorMatches: function(id) {
                return this.deleteRecord(gradescaleDescAddr, id);
            },
            deleteCreditColors: function(id) {
                return this.deleteRecord(colorsWriteAddr, id);
            },
            deleteTestBand: function(id) {
                return this.deleteRecord(testBandsAddr, id);
            }
        }
    });
});