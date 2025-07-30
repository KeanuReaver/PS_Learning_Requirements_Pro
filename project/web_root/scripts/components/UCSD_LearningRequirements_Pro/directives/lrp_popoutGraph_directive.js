'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('graphPopout', ['$document', '$timeout', function ($document, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                graphData: '=',
                isPopupOpen: '=',
                popupTitle: '=',
                closePopup: '&',  
                graphType: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/graphPopout_template.html',
            link: function (scope, element) {
                let startX = 0, startY = 0, popupOffsetX = 0, popupOffsetY = 0;
                const contentMain = document.getElementById('container-frame') || document.getElementById('container');
                const contentMainRect = contentMain.getBoundingClientRect() || {};
                const popupElement = element.find('.lrp-popup')[0]; // Get the actual popup element

                scope.popupPosition = scope.popupPosition || { top: '100px', left: '100px' };

                scope.startDrag = function (event) {
                    event.preventDefault();

                    startX = event.clientX;
                    startY = event.clientY;

                    popupOffsetX = parseInt(scope.popupPosition.left, 10) || 0;
                    popupOffsetY = parseInt(scope.popupPosition.top, 10) || 0;

                    $document.on('mousemove', performDrag);
                    $document.on('mouseup', stopDrag);
                };

                function performDrag(event) {
                    const deltaX = event.clientX - startX;
                    const deltaY = event.clientY - startY;

                    // Calculate new position considering boundaries
                    let newLeft = popupOffsetX + deltaX;
                    let newTop = popupOffsetY + deltaY;

                    // Enforce minimum left and top within content-main
                    newLeft = Math.max(0, Math.min(newLeft, contentMainRect.width - popupElement.offsetWidth));
                    newTop = Math.max(0, Math.min(newTop, contentMainRect.height - popupElement.offsetHeight));

                    scope.$apply(() => {
                        scope.popupPosition.top = `${newTop}px`;
                        scope.popupPosition.left = `${newLeft}px`;
                    });
                }

                function stopDrag() {
                    $document.off('mousemove', performDrag);
                    $document.off('mouseup', stopDrag);
                }
            }
        };
    }]);
});