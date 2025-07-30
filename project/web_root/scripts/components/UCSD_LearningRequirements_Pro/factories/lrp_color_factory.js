'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('colorLogic', ($q, writeData, deleteData) => {
        return {
            organizeChanges: function(colors) {
                const promises = colors.map(record => {
                    if (record.isdirty === 1 && record.type) {
                        const args = { colorcode: record.colorcode || '' };
                        if (!record.id) {
                            args.credittype = record.code;
                            args.typename = record.type;
                        }
                        return writeData.writeColors(args, record.id);
                    }
                });
                return $q.all(promises);
            },
            isValidColor: function(code) {
                const hexPattern = /^#([0-9A-F]{3}){1,2}$/i; // hex
                const rgbPattern = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*([01]?(\.\d+)?))?\)$/; // RGB
                
                return hexPattern.test(code) || rgbPattern.test(code);
            },
            processScoreColors: function(records) {
                const promisesAll = records.map(record => {
                    if (record.deleteRecord == 1) {
    // Handle deletion of associated records before this delete if needed
                        return deleteData.deleteScoreColor(record.id)
                            .catch(error => { 
                                throw error; 
                            });
                    } else {
                        return writeData.writeScoreColors({ colorcode: record.colorcode }, record.id)
                            .catch(error => { throw error; });
                    }
                });
            
                return $q.all(promisesAll)
                    .catch(error => {
                        throw error; 
                    });
            },
            previewColor: function(colorcode, size='1em', width = null) {
                if (!width) width = size;
                return {
                    'width': width,
                    'height': size,
                    'padding': '1px',
                    'background-color': this.isValidColor(colorcode) ? colorcode : '#000000',
                    'margin': '0 auto', 
                    'display': 'block',
                    'line-height': size
                };
            }
        }
    });
});