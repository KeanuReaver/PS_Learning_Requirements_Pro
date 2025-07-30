'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');
    
    module.controller('GradeScaleSortController', ['$q', '$scope', 'getData', 'writeData', 'deleteData', 'showBreadcrumbs', 'colorLogic',
            'gradescaleSortAddr', function($q, $scope, getData, writeData, deleteData, showBreadcrumbs, colorLogic, gradescaleSortAddr) {
        $scope.schoolid; // init value
        
        $scope.gradeScaleItems;
        
        $j(() => {
            loadingDialog('Loading GradeScaleItems . . . ');
            getSchoolGradeScales();
            showBreadcrumbs.showBread();
        });
        
        function getSchoolGradeScales() {
            getData.getGradeScaleSort($scope.schoolid)
                .then(response => {
                    $scope.gradeScaleItems = response.sort((a, b) => parseInt(a.sortorder, 10) - parseInt(b.sortorder, 10)) || [];
                    console.log($scope.gradeScaleItems);
                })
                .catch(error => console.error('Failed to get schools grade scale items:', error))
                .finally(() => closeLoading());
        }
        
        $scope.previewColor = (colorcode) => colorLogic.previewColor(colorcode);
        
        $scope.submitChanges = function() {
            loadingDialog('Saving Changes . . . ');
            const promises = $scope.gradeScaleItems.map(record => {
                const args = { 
                    'sortorder': `${record.sortorder}`,
                    'school_number': $scope.schoolid,
                    'hide': record.hide || '0'
                };
                if (!record.orderid) {
                    args['gradescaleitemdcid'] = record.gsidcid;
                }
                console.log(args);
                return writeData.writeGSISort(args, record.orderid)
                    .then(response => console.log(response))
                    .catch(error => console.error('Failed to write:', error));
            });
            
            $q.all(promises)
                .then(() => getSchoolGradeScales())
                .catch(error => console.error('Failed to save changes:', error))
                .finally(() => closeLoading());
        }
        
        $scope.sortableOptions = {
            handle: '.lrpHandle',
            stop: function() {
                $scope.gradeScaleItems.forEach((record, index) => {
                    record.sortorder = index; 
                });
                console.log($scope.gradeScaleItems);
            }
        }
        
        $scope.deleteRecords = function(record) {
            recordsToDelete.forEach(record => {
                deleteData.deleteRecord(gradescaleSortAddr, record)
                    .then(response => console.log(response))
                    .catch(error => console.error('Failed:', error));
            });
        }
    }]);
});