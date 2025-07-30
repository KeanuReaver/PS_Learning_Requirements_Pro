'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.controller('GradeScaleDrawerController', ['$scope', '$q', 'dataManagement', 'writeData',
            function($scope, $q, dataManagement, writeData) {
        $scope.init = function(drawerData, scoreColorList) {
            $scope.drawerData = drawerData;
            $scope.scoreColorList = scoreColorList;
            console.log()
        };
    
        
        function closeDrawer() {
            $scope.drawerHeader = '';
            $scope.drawerData = [];
            dataManagement.closeLRPDrawer();
        }

        $scope.saveChanges = function() {
            loadingDialog('Saving changes . . . ');
            const promises = [];
            for (const item of $scope.selectedList) {
                const id = item.existing == 'Existing' ? item.gsidcid : null;
                const args = {
                    'detailed_description': item.ulrpdesc || '',
                    'gradescaleitemdcid': id || item.gsidcid
                }
                if (item.colorlistid && item.colorlistid.trim() !== '') args['lrp_color_list_id'] = item.colorlistid;
                promises.push(writeData.writeGradeScaleDesc(args, id));
            }

            $q.all(promises)
                .catch(error => console.error('Failed to save records:', error))
                .finally(() => {
                    closeDrawer();
                    closeLoading();
                });
        }

        $scope.closeThisDrawer = () => {
            closeDrawer();
        }
        
        $scope.convertToInt = (input) => {
            return parseInt(input, 10) || 0;
        }
    }]);
});