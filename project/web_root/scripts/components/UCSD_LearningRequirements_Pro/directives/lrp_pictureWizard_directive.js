'use strict';
define(function (require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('lrpWizardPopup', function ($document, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                steps: '=',
                tranTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/pictureWizard_template.html',
            link: function (scope) {
                // Initialize wizard state
                scope.isOpen = false;
                scope.currentStep = 0;

                // Open the wizard
                scope.openWizard = function () {
                    scope.isOpen = true;
                    scope.currentStep = 0; // Start at the first step
                    $timeout(() => {
                        const popup = document.querySelector('.picture-wizard-popout-window');
                        if (popup) {
                            popup.setAttribute('tabindex', '-1');
                            popup.focus();
                        }
                    }, 0);
                };

                // Close the wizard
                scope.closeWizard = function () {
                    scope.isOpen = false;
                };

                // Navigate to the next step
                scope.nextStep = function () {
                    if (scope.currentStep < scope.steps.length - 1) {
                        scope.currentStep++;
                        refreshAriaLive();
                    }
                };

                // Navigate to the previous step
                scope.prevStep = function () {
                    if (scope.currentStep > 0) {
                        scope.currentStep--;
                        refreshAriaLive();
                    }
                };
                
                scope.$watch('isOpen', function (newVal) {
                    if (newVal) {
                        $document.on('keydown', handleWizardKeydown);
                    } else {
                        $document.off('keydown', handleWizardKeydown);
                    }
                });
                
                function handleWizardKeydown(event) {
                    // Left Arrow
                    if (event.key === 'ArrowLeft' && scope.currentStep > 0) {
                        event.preventDefault();
                        scope.$apply(() => scope.prevStep());
                    }
                
                    // Right Arrow
                    if (event.key === 'ArrowRight' && scope.currentStep < scope.steps.length - 1) {
                        event.preventDefault();
                        scope.$apply(() => scope.nextStep());
                    }
                
                    // Optional: Close on Escape
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        scope.$apply(() => scope.closeWizard());
                    }
                }
                
                function refreshAriaLive() {
                    $timeout(() => {
                        const textEl = document.getElementById('wizard-step-text');
                        if (textEl) {
                            textEl.setAttribute('aria-live', 'off');
                            void textEl.offsetHeight;
                            textEl.setAttribute('aria-live', 'polite');
                        }
                    }, 0);
                }
                
                $timeout(() => {
                    const textEl = document.getElementById('wizard-step-text');
                    if (textEl) {
                        textEl.setAttribute('aria-live', 'off');
                        void textEl.offsetHeight; // force reflow
                        textEl.setAttribute('aria-live', 'polite');
                    }
                }, 0);
                
                scope.$on('$destroy', function () {
                    $document.off('keydown', handleWizardKeydown);
                });
            }
        };
    });
});