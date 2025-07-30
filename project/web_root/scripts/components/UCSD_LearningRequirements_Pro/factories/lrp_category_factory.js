'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.factory('catLogic', ($q, writeData, deleteData, categoriesWriteAddr) => {
        return {
            organizeCats: function(categories) {
                const promisesAll = categories.map(record => {
                    if (record.id && record.todelete == 1) {
                        return deleteData.deleteRecord(categoriesWriteAddr, record.id)
                            .then(() => ({ record, status: 'succeeded' }))
                            .catch((error) => ({ error, status: 'failed' }));
                    } else {
                        const args = {
                            name: record.catname || '',
                            details: record.details || '',
                            sortorder: record.sortorder || '0',
                            style: record.catstyle || '',
                            academic: record.academic || 1
                        };
                        return writeData.writeCategories(args, record.id)
                            .then(() => ({ record, status: 'succeeded' }))
                            .catch((error) => ({ error, status: 'failed' }));
                    }
                });
            
                return Promise.allSettled(promisesAll);
            },
            updateStdCatAssoc: function(standardList) {
                const recordsToUpdate = standardList.filter(record => record.dirty === 1);
        
                const promises = recordsToUpdate.map(record => {
                    const args = {
                        category: record.catid || ''
                    };
                    if (!record.stdcatid) args.standardstandardid = record.standardid;
        
                    return writeData.writeStdCat(args, record.stdcatid);
                });
        
                return $q.all(promises)
            }
        }
    });
});