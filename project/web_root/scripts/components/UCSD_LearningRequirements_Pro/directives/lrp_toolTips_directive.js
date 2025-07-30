'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive("tooltipFollow", ['$document', '$timeout', function ($document, $timeout) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                let tooltipElement;

                // Inject CSS for the tooltip
                const injectTooltipCSS = () => {
                    const styleId = 'tooltipFollowStyles';
                    if (!$document[0].getElementById(styleId)) {
                        const style = angular.element('<style id="' + styleId + '">')
                            .text(`
                                .tooltip {
                                    position: absolute;
                                    padding: 8px;
                                    background: rgba(0, 0, 0, 0.8);
                                    color: #fff;
                                    border-radius: 4px;
                                    font-size: 12px;
                                    pointer-events: none;
                                    opacity: 0;
                                    transition: opacity 0.2s ease;
                                    z-index: 9999;
                                }
                                .tooltip.visible {
                                    opacity: 1;
                                }
                            `);
                        angular.element($document[0].head).append(style);
                    }
                };

                injectTooltipCSS();

                // Create tooltip
                const createTooltip = () => {
                    if (!tooltipElement) {
                        tooltipElement = angular.element('<div class="tooltip"></div>');
                        const tooltipText = attrs.tooltipTitle || "Tooltip"; // Fallback to a default title
                        tooltipElement.text(tooltipText);
                        angular.element($document[0].body).append(tooltipElement);
                    }
                };

                // Update tooltip position
                const updateTooltipPosition = (event) => {
                    const offsetX = 10;
                    const offsetY = 10;

                    tooltipElement.css({
                        left: event.pageX + offsetX + "px",
                        top: event.pageY + offsetY + "px",
                    });
                };

                // Show tooltip
                const showTooltip = (event) => {
                    if (!tooltipElement) createTooltip();
                    updateTooltipPosition(event);
                    tooltipElement.addClass("visible");
                };

                // Hide tooltip
                const hideTooltip = () => {
                    if (tooltipElement) {
                        tooltipElement.removeClass("visible");
                        $timeout(() => {
                            if (tooltipElement) {
                                tooltipElement.remove();
                                tooltipElement = null; // Nullify only after removal
                            }
                        }, 200);
                    }
                };

                // Attach mouse events
                element.on("mousemove", showTooltip);
                element.on("mouseleave", hideTooltip);

                // Clean up on directive destroy
                scope.$on("$destroy", () => {
                    hideTooltip();
                    element.off("mousemove", showTooltip);
                    element.off("mouseleave", hideTooltip);
                });
            }
        };
    }]);
});
