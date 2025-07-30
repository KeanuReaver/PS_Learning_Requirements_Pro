'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('gradeScaleItemDrawer', [function() {
        return {
            restrict: 'EA',
            scope: {
                selected: '=',
                selectedList: '=',
                scoreColorList: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/gradeScaleItems_template.html',
            controller: ['$scope', '$q', 'dataManagement', 'writeData', 'colorLogic',
                    function($scope, $q, dataManagement, writeData, colorLogic) {
                $scope.isDropdownOpen = false;
                $scope.selectedColor = {};
                
                function closeDrawer() {
                    $scope.selected = {};
                    $scope.selectedList = [];
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
                
                $scope.toggleDropdown = function(item) {
                    // Toggle the dropdown for the specific item
                    item.isDropdownOpen = !item.isDropdownOpen;
                    console.log(item);
                };
                
                $scope.selectColor = function(item, color) {
                    item.colorlistid = color.id;
                    item.colorcode = color.colorcode;
                    item.isDropdownOpen = false;
                    
                    console.log(item);
                };
                
                $scope.previewColor = (color) => {
                    return colorLogic.previewColor(color);
                }
                
                $j(document).on('click', function(event) {
                    const $target = $j(event.target);
                    const isClickInsideDropdown = $target.closest('.lrp-custom-dropdown').length > 0;
        
                    $scope.$apply(() => {
                        $scope.selectedList.forEach(item => {
                            if (!isClickInsideDropdown) {
                                item.isDropdownOpen = false;
                            }
                        });
                    });
                });
            }]
        }
    }]);
});