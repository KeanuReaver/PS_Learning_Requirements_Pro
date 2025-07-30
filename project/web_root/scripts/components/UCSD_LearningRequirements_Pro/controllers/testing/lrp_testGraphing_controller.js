'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('TestGraphingController', ['$scope', function($scope) {
        // Test Fusion
        let prefersDarkScheme = $window.matchMedia('(prefers-color-scheme: dark)');
        $scope.theme = prefersDarkScheme.matches ? 'candy' : 'fusion';
    
        // Watch for changes in color scheme preference
        prefersDarkScheme.addEventListener('change', (event) => {
            $scope.$apply(() => {
                $scope.theme = event.matches ? 'candy' : 'fusion';
            });
        });
        
        $scope.myDataSource = {
            chart: {
                caption: "Countries With Most Oil Reserves [2017-18]",
                subCaption: "In MMbbl = One Million barrels",
                xAxisName: "Country",
                yAxisName: "Reserves (MMbbl)",
                numberSuffix: "K",
                theme: $scope.theme,
            },
            // Chart Data - from step 2
            "data": [
                { label: 'Venezuela', value: '290' },
                { label: 'Saudi', value: '260' },
                { label: 'Canada', value: '180' },
                { label: 'Iran', value: '140' },
                { label: 'Russia', value: '115' },
                { label: 'UAE', value: '100' },
                { label: 'US', value: '30' },
                { label: 'China', value: '30' }
            ]
        };
    }]);
});