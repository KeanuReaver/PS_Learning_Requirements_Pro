'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('attBandColors', [
            '$scope', '$q', 'getData', 'colorLogic', 'dataManagement', 'showBreadcrumbs', 'writeData',
            'deleteData', function($scope, $q, getData, colorLogic, dataManagement, showBreadcrumbs,  
                writeData, deleteData) {
        $scope.attBands = [];
        $scope.scoreColorList = [];
        $scope.pageError = ''; 

        function loadData() {
            
            const colors = getData.getScoreColorList();
            const bands  = getData.getAttBands();

            $q.all([colors, bands])
                .then(([colorlist, bandlist]) => {
                    $scope.scoreColorList = colorlist;
                    // Normalize property names to match what we save (top_band/bottom_band)
                    console.log(bandlist);
                    $scope.attBands = (bandlist || []).map(b => ({
                        id: b.id,
                        label: b.label || '',
                        colorlistid: b.colorlistid || null,
                        colorcode: b.colorcode || '',
                        top_band: (b.top_band != null ? Number(b.top_band) : null),
                        bottom_band: (b.bottom_band != null ? Number(b.bottom_band) : null),
                        deleteRecord: b.deleteRecord || 0,
                        default_band: b.default_band || 0,
                        display_alert: b.display_alert || 0
                    }));
                    console.log($scope.attBands);
                })
                .catch(error => {
                    console.error('Failed to pull data:', error);
                })
                .finally(() => closeLoading());
        }

        $scope.previewColor = function(colorcode) {
            return colorLogic.previewColor(colorcode);
        };

        $scope.warnBadColorCode = (colorcode) => {
            return colorLogic.isValidColor(colorcode);
        };

        $scope.toggleDropdown = (item) => item.isDropdownOpen = !item.isDropdownOpen;

        $scope.selectColor = function(item, color) {
            if (!color) {
                // "None" choice
                item.colorlistid = null;
                item.colorcode = '';
            } else {
                item.colorlistid = color.id;
                item.colorcode   = color.colorcode;
            }
            $scope.toggleDropdown(item);
        };

        $scope.deleteBand = function(record) {
            try {
                [record, $scope.attBands] = dataManagement.markForDelete(record, $scope.attBands);
            } catch(error) {
                console.error('Failed to mark for delete', error);
            }
        };

        $scope.addNewBand = () => {
            $scope.attBands.push({
                id: null,
                label: '',
                colorlistid: null,
                colorcode: '',
                top_band: null,
                bottom_band: null,
                deleteRecord: 0
            });
        };
        
        $scope.resetDefault = function(band) {
            for (const record of $scope.attBands) {
                if (record !== band && record.default_band == 1) {
                    record.default_band = 0;
                    record.isDirty = 1;
                }
            }
            band.isDirty = 1;
        };
        
        $scope.markDirty = (band) => band.isDirty = 1;

        // --- Validation helpers ---
        function sanitizeNum(n) {
            if (n === '' || n === null || n === undefined) return null;
            const v = Number(n);
            return Number.isFinite(v) ? v : null;
        }

        function validateBands(bands) {
            // Return { ok: boolean, message?: string }
            // 1) required per-row: label, top_band, bottom_band
            for (const [i, b] of bands.entries()) {
                if (b.deleteRecord == 1) continue;
                const label = (b.label || '').trim();
                const top   = sanitizeNum(b.top_band);
                const bot   = sanitizeNum(b.bottom_band);

                if (!label || top === null || bot === null) {
                    return { ok: false, message: `Row ${i+1}: label, top, and bottom are required.` };
                }
                if (top < 0 || top > 100 || bot < 0 || bot > 100) {
                    return { ok: false, message: `Row ${i+1}: values must be between 0 and 100.` };
                }
                if (bot > top) {
                    return { ok: false, message: `Row ${i+1}: bottom cannot be greater than top.` };
                }
            }

            // 2) overlap check across active rows
            // Treat ranges as [bottom, top) so touching at the boundary is allowed.
            const active = bands
                .filter(b => b.deleteRecord != 1)
                .map(b => ({
                    label: (b.label || '').trim(),
                    low: Number(b.bottom_band),
                    high: Number(b.top_band)
                }))
                .filter(r => Number.isFinite(r.low) && Number.isFinite(r.high)) // <— add this line
                .sort((a, b) => (a.low - b.low) || (a.high - b.high));

            for (let i=0; i<active.length; i++) {
                for (let j=i+1; j<active.length; j++) {
                    const A = active[i], B = active[j];
                    // overlap if max(low) < min(high) — using < makes touching edges OK
                    if (Math.max(A.low, B.low) < Math.min(A.high, B.high)) {
                        return { ok: false, message: `Bands "${A.label}" and "${B.label}" overlap. Adjust top/bottom so bands only touch at edges (e.g., 90–95 and 95–100).` };
                    }
                }
            }

            return { ok: true };
        }
        
        function validateForm() {
            const val = validateBands($scope.attBands);
            if (!val.ok) {
                $scope.pageError = val.message || 'Bands cannot overlap.';
                return true;
            }
            if (!$scope.attBands.some(rec => rec.default_band == 1)) {
                $scope.pageError = 'Must have a default band';
                return true;
            }
            if ($scope.attBands.find(rec => rec.default_band == 1).deleteRecord == 1) {
                $scope.pageError = 'Cannot delete the default band. Change the default band before deleting.';
                return true;
            }
            if ($scope.attBands.some(rec => !rec.label || !rec.top_band || !rec.bottom_band)) {
                $scope.pageError = 'Missing required fields.';
            }
            return false;
        }

        $scope.submitChanges = function() {
            $scope.pageError = '';

            if (validateForm()) return;
            loadingDialog('Saving Records');
            
            const promises = [];
            for (const item of $scope.attBands) {
                if (item.deleteRecord == 1 && item.id) {
                    promises.push(deleteData.deleteAttBand(item.id));
                } else if (item.isDirty == 1) {
                    const args = {
                        label: String(item.label || ''),
                        top_band: String(sanitizeNum(item.top_band)),
                        bottom_band: String(sanitizeNum(item.bottom_band)),
                        default_band: String(item.default_band),
                        display_alert: String(item.display_alert) || '0'
                    };
                    if (item.colorlistid) args.colorlistid = item.colorlistid;
                    promises.push(writeData.writeAttBands(args, item.id || null));
                }   
            }

            $q.all(promises)
                .catch(error => console.error('Failed to save records:', error))
                .finally(() => loadData());
        };

        // Close all dropdowns on outside click
        $j(document).on('click', function(event) {
            const $target = $j(event.target);
            const isClickInsideDropdown = $target.closest('.lrp-custom-dropdown').length > 0;
            if (!isClickInsideDropdown) {
                $scope.$apply(() => {
                    ($scope.attBands || []).forEach(item => { item.isDropdownOpen = false; });
                });
            }
        });

        $j(() => {
            loadingDialog();
            showBreadcrumbs.showBread();
            loadData();
        });
    }]);
});