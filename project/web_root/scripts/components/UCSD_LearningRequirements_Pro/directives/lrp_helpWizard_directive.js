'use strict';
define(function (require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('helpWizard', ['OverlayService', function (OverlayService, $timeout, $document) {
        return {
            restrict: 'A',
            scope: {
                wizardSteps: '=' // Pass an array of steps
            },
            link: function (scope) {
                let currentStep = 0;

                const showStep = () => {
                    const step = scope.wizardSteps[currentStep];
                    if (step) {
                        const element = document.querySelector(step.selector);
                        if (element) {
                            OverlayService.createOverlay(element, step.text, () => {
                                // Callback for "Next" button
                                currentStep++;
                                if (currentStep < scope.wizardSteps.length) {
                                    showStep();
                                }
                            });
                        }
                    }
                };

                // Start the wizard when triggered
                scope.$on('startWizard', function () {
                    currentStep = 0;
                    showStep();
                    
                    $timeout(() => {
                        const popup = document.querySelector('.picture-wizard-popout-window');
                        if (popup) {
                            popup.setAttribute('tabindex', '-1');
                            popup.focus();
                        }
                    }, 0);
                });
                
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
                
                scope.$on('$destroy', function () {
                    $document.off('keydown', handleWizardKeydown);
                });
            }
        };
    }]);
});