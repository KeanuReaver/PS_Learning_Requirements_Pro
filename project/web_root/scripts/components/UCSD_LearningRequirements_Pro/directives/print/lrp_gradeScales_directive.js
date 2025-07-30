'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('printViewGradeScales', ['colorLogic', function(colorLogic) {
        return {
            restrict: 'EA',
            scope: {
                gradeScales: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/print/gradeScales_template.html',
            link: function(scope, element, attrs) {
                scope.previewColor = function(colorcode, width = null) {
                    return colorLogic.previewColor(colorcode, width);
                };
            }
        };
    }]);
});