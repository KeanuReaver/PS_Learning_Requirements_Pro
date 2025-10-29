'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('bubbleTextService', ['$window', '$timeout', function ($window, $timeout) {
        // -------- utilities (kept private) --------
        function parseRGB(str) {
            const m = str && str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
        }
        function isTransparent(bg) {
            return !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)';
        }
        function relLum(r, g, b) {
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
        function findEffectiveBG(node) {
            // Walk up until a painted backgroundColor is found; fall back to body/html/white
            const doc = node.ownerDocument;
            let cur = node;
            while (cur && cur !== doc.documentElement) {
                const bg = getComputedStyle(cur).backgroundColor;
                if (!isTransparent(bg)) return bg;
                cur = cur.parentElement;
            }
            // fallback: body -> html -> white
            const bodyBG = getComputedStyle(doc.body).backgroundColor;
            if (!isTransparent(bodyBG)) return bodyBG;
            const htmlBG = getComputedStyle(doc.documentElement).backgroundColor;
            if (!isTransparent(htmlBG)) return htmlBG;
            return 'rgb(255,255,255)';
        }

        function applyToNode(node, threshold) {
            const rgb = parseRGB(findEffectiveBG(node));
            if (!rgb) return;
            const light = relLum(rgb.r, rgb.g, rgb.b) > threshold;
            // Always keep base class; only toggle the modifier
            if (!node.classList.contains('bubble-text')) node.classList.add('bubble-text');
            node.classList.toggle('bubble-text--light-bg', light);
        }

        // -------- public API --------
        let cfg = { threshold: 140 };
        let running = false;
        let raf = null;
        let bodyObs = null, htmlObs = null;

        function refreshAll(root) {
            const scope = root || document;
            const nodes = scope.querySelectorAll('.bubble-text, .bubble-text--light-bg');
            for (const n of nodes) applyToNode(n, cfg.threshold);
        }

        function scheduleRefresh() {
            if (raf) return;
            raf = $window.requestAnimationFrame(function () {
                raf = null;
                refreshAll();
            });
        }

        function startAuto(options) {
            if (running) return;
            running = true;
            cfg = Object.assign({}, cfg, options);
        
            function safeInit() {
                // After next paint, then a couple of safety passes
                $window.requestAnimationFrame(function () {
                    refreshAll();
                    $timeout(refreshAll, 100, false);  // don't force a digest
                    $timeout(refreshAll, 300, false);
                });
            }
        
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                safeInit();
            } else {
                document.addEventListener('DOMContentLoaded', safeInit, { once: true });
            }
        
            // resize (rAF-throttled via scheduleRefresh)
            angular.element($window).on('resize', scheduleRefresh);
        
            // observe body/html class changes (theme toggles)
            const body = document.body;
            bodyObs = new MutationObserver(function (muts) {
                for (const m of muts) {
                    if (m.type === 'attributes' && m.attributeName === 'class') {
                        scheduleRefresh();
                        break;
                    }
                }
            });
            bodyObs.observe(body, { attributes: true, attributeFilter: ['class'] });
        
            const html = document.documentElement;
            htmlObs = new MutationObserver(() => scheduleRefresh());
            htmlObs.observe(html, { attributes: true, attributeFilter: ['class'] });
        
            // Optional: custom theme event
            document.addEventListener('ucsd:themechange', scheduleRefresh);
        }

        function stopAuto() {
            if (!running) return;
            running = false;

            angular.element($window).off('resize', scheduleRefresh);
            if (raf) { $window.cancelAnimationFrame(raf); raf = null; }
            if (bodyObs) { bodyObs.disconnect(); bodyObs = null; }
            if (htmlObs) { htmlObs.disconnect(); htmlObs = null; }
            document.removeEventListener('ucsd:themechange', scheduleRefresh);
        }

        return {
            startAuto, stopAuto, refreshAll
        };
    }]);
});