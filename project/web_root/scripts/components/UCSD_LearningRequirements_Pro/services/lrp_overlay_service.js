'use strict';
define(function (require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.service('OverlayService', ['$document', function ($document) {
        let overlay = null;
        let textBox = null;
        let nextButton = null;
        let onNextCallback = null; // Callback for the "Next" button

        this.createOverlay = function (targetElement, text, onNext) {
            if (!targetElement) return;

            const rect = targetElement.getBoundingClientRect();
            onNextCallback = onNext;

            // Create overlay
            overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.border = '2px solid red';
            overlay.style.zIndex = '1000';
            overlay.style.pointerEvents = 'none';
            overlay.style.top = `${rect.top + window.scrollY}px`;
            overlay.style.left = `${rect.left + window.scrollX}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;

            // Create text box
            textBox = document.createElement('div');
            textBox.innerText = text || 'No description provided';
            textBox.classList.add('lrp-help-wizard-text')
            textBox.style.position = 'absolute';
            textBox.style.zIndex = '1001';
            textBox.style.border = '1px solid black';
            textBox.style.padding = '10px';
            textBox.style.borderRadius = '5px';
            textBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            textBox.style.maxWidth = '300px';

            // Position text box dynamically (below or above)
            const textBoxTop = rect.top + window.scrollY + rect.height + 10; // Below by default
            const isBelowViewport = textBoxTop + 50 > window.innerHeight; // Check if it overflows
            if (isBelowViewport) {
                // Place above the element
                textBox.style.top = `${rect.top + window.scrollY - 50}px`;
            } else {
                // Place below the element
                textBox.style.top = `${textBoxTop}px`;
            }

            textBox.style.left = `${rect.left + window.scrollX}px`;

            // Create "Next" button
            nextButton = document.createElement('button');
            nextButton.innerText = 'Next';
            nextButton.style.position = 'absolute';
            nextButton.style.zIndex = '1002';
            nextButton.style.marginTop = '10px';
            nextButton.style.padding = '5px 10px';
            nextButton.style.cursor = 'pointer';
            nextButton.style.top = `${parseFloat(textBox.style.top) + 50}px`;
            nextButton.style.left = textBox.style.left;

            // Add "Next" button click event
            nextButton.addEventListener('click', () => {
                if (onNextCallback) {
                    this.removeOverlay(); // Remove current overlay before moving to next
                    onNextCallback();
                }
            });

            // Append elements to the document
            $document[0].body.appendChild(overlay);
            $document[0].body.appendChild(textBox);
            $document[0].body.appendChild(nextButton);
        };

        this.removeOverlay = function () {
            if (overlay) {
                overlay.remove();
                overlay = null;
            }
            if (textBox) {
                textBox.remove();
                textBox = null;
            }
            if (nextButton) {
                nextButton.remove();
                nextButton = null;
            }
        };
    }]);
});