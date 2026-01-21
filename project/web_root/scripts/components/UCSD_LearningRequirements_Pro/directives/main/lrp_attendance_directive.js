'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('mainViewAttendance', [function() {
        return {
            restrict: 'EA',
            scope: {
                curyearid: '=',
                portalAddress: '=',
                tranTags: '=',
                attData: '=',
                attBands: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/main/attendance_template.html',
            controller: ['$scope', 'getData', 'attLogic', function($scope, getData, attLogic) {
                $scope.cur_year_graph = {};
                $scope.currentBand = {};
                $scope.thermoValue;
                $scope.currentBand;
                
                function populateAttendance() {
                    if (!$scope.attData || $scope.attData.length === 0) return;
                    for (const r of $scope.attData) r.yearid = Number(r.yearid);
                    
                    const maxYear = $scope.attData.reduce((mx, r) => Math.max(mx, r.yearid || 0), 0);
                    const adaadm = attLogic.calcAdaAdmForYear($scope.attData, maxYear);
                    $scope.cur_year_graph = {
                        yearid: maxYear,
                        adaadm_ratio: adaadm,
                        adaadm_percent: adaadm !== null ? (adaadm * 100) : null,
                        name: $scope.attData.find(rec => rec.yearid === maxYear).year_abbr
                    }
                    $scope.thermoValue = $scope.cur_year_graph.adaadm_percent !== null
                        ? Math.round($scope.cur_year_graph.adaadm_percent)
                        : null;
                    $scope.currentBand = attLogic.getCurrentBand($scope.thermoValue, $scope.attBands) || {};
                }
                
                $scope.fcTheme = attLogic.getThemeFromBody();
                
                $scope.bandTextColor = (hex) => attLogic.getBandTextColor(hex);

                $scope.$watchGroup(['attBands', 'attData'], function(vals) {
                    if (vals && vals[0] && vals[1]) {
                        populateAttendance();
                        // console.log($scope.attData);
                    }
                });                
            }]
        }
    }]);
});