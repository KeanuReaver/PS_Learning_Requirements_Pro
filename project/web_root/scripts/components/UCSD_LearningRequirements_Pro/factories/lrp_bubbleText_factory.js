'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('bubbleTextService', ['$window', '$timeout', function ($window, $timeout) {
        // -------- utilities --------
        function parseRGB(str) {
            const m = str && str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            return m ? {
                r: +m[1],
                g: +m[2],
                b: +m[3]
            } : null;
        }

        function isTransparent(bg) {
            return !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)';
        }

        function relLum(r, g, b) {
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        function findEffectiveBG(node) {
            const doc = node.ownerDocument;
            let cur = node;
            while (cur && cur !== doc.documentElement) {
                const bg = getComputedStyle(cur).backgroundColor;
                if (!isTransparent(bg)) return bg;
                cur = cur.parentElement;
            }
            const bodyBG = getComputedStyle(doc.body).backgroundColor;
            if (!isTransparent(bodyBG)) return bodyBG;
            const htmlBG = getComputedStyle(doc.documentElement).backgroundColor;
            if (!isTransparent(htmlBG)) return htmlBG;
            return 'rgb(255,255,255)';
        }

        function applyToNode(node, threshold) {
            if (!(node instanceof Element)) return;
            const rgb = parseRGB(findEffectiveBG(node));
            if (!rgb) return;
            const light = relLum(rgb.r, rgb.g, rgb.b) > threshold;
            if (!node.classList.contains('bubble-text')) {
                node.classList.add('bubble-text');
            }
            node.classList.toggle('bubble-text--light-bg', light);
        }

        // -------- public state --------
        let cfg = {
            threshold: 140,
            debug: false
        };
        let running = false,
            raf = null;
        let bodyObs = null,
            htmlObs = null,
            bodySwapObs = null;
        let pollId = null,
            lastBodyClass = '',
            lastHtmlClass = '';

        let subtreeObs = null;
        let clickHandler = null;

        function refreshAll(root) {
            const scope = root || document;
            const nodes = scope.querySelectorAll(
                '.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]'
            );
            for (const n of nodes) applyToNode(n, cfg.threshold);
        }

        function refreshSubtree(root) {
            if (!root || !(root instanceof Element)) return;
            // check root
            if (
                root.matches('.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]')
            ) {
                applyToNode(root, cfg.threshold);
            }
            // check children
            const nodes = root.querySelectorAll(
                '.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]'
            );
            for (const n of nodes) applyToNode(n, cfg.threshold);
        }

        function scheduleRefresh() {
            if (raf) return;
            raf = $window.requestAnimationFrame(function () {
                raf = null;
                if (cfg.debug) console.debug('[bubbleTextService] refreshAll()');
                refreshAll();
            });
        }

        // Added mutation observers to try to make it more responsive
        function attachThemeObservers() {
            if (bodyObs) {
                bodyObs.disconnect();
                bodyObs = null;
            }
            if (htmlObs) {
                htmlObs.disconnect();
                htmlObs = null;
            }

            const body = document.body;
            const html = document.documentElement;

            lastBodyClass = body ? body.className : '';
            lastHtmlClass = html.className;

            if (body) {
                bodyObs = new MutationObserver((muts) => {
                    for (const m of muts) {
                        if (m.type === 'attributes' && m.attributeName === 'class') {
                            if (cfg.debug) console.debug('[bubbleTextService] body class changed');
                            scheduleRefresh();
                            break;
                        }
                    }
                });
                bodyObs.observe(body, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }

            htmlObs = new MutationObserver((muts) => {
                for (const m of muts) {
                    if (m.type === 'attributes' && m.attributeName === 'class') {
                        if (cfg.debug) console.debug('[bubbleTextService] html class changed');
                        scheduleRefresh();
                        break;
                    }
                }
            });
            htmlObs.observe(html, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // reattach if body is replaced
        function watchForBodyReplacement() {
            if (bodySwapObs) {
                bodySwapObs.disconnect();
                bodySwapObs = null;
            }
            bodySwapObs = new MutationObserver(() => {
                if (!document.body) return;
                if (cfg.debug) console.debug('[bubbleTextService] body replacement detected, reattaching observers');
                attachThemeObservers();
                scheduleRefresh();
            });
            bodySwapObs.observe(document.documentElement, {
                childList: true,
                subtree: false
            });
        }

        // light polling fallback (somewhat seems to work, but still misses sometimes)
        function startPolling() {
            if (pollId) return;
            pollId = $window.setInterval(function () {
                const b = document.body ? document.body.className : '';
                const h = document.documentElement.className;
                if (b !== lastBodyClass || h !== lastHtmlClass) {
                    if (cfg.debug) console.debug('[bubbleTextService] poll detected class flip');
                    lastBodyClass = b;
                    lastHtmlClass = h;
                    scheduleRefresh();
                }
            }, 500);
        }

        function stopPolling() {
            if (pollId) {
                $window.clearInterval(pollId);
                pollId = null;
            }
        }

        // Check new nodes
        function startSubtreeObserver() {
            if (subtreeObs) {
                subtreeObs.disconnect();
                subtreeObs = null;
            }
            const body = document.body;
            if (!body) return;

            subtreeObs = new MutationObserver(muts => {
                for (const m of muts) {
                    if (m.type === 'attributes') {
                        const t = m.target;
                        if (!(t instanceof Element)) continue;

                        if (
                            m.attributeName === 'class' ||
                            m.attributeName === 'style'
                        ) {
                            // If this element is a bubble-text node or has the auto flag,
                            // or is a container that might have those as descendants.
                            if (
                                t.matches('.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]') ||
                                t.querySelector('.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]')
                            ) {
                                if (cfg.debug) console.debug('[bubbleTextService] subtree attribute change near bubble-text');
                                refreshSubtree(t);
                            }
                        }
                    } else if (m.type === 'childList') {
                        // If new nodes were added, check them and their descendants
                        m.addedNodes && m.addedNodes.forEach(node => {
                            if (!(node instanceof Element)) return;
                            if (
                                node.matches('.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]') ||
                                node.querySelector('.bubble-text, .bubble-text--light-bg, [data-bubble-text-auto]')
                            ) {
                                if (cfg.debug) console.debug('[bubbleTextService] subtree childList change near bubble-text');
                                refreshSubtree(node);
                            }
                        });
                    }
                }
            });

            subtreeObs.observe(body, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }

        function stopSubtreeObserver() {
            if (subtreeObs) {
                subtreeObs.disconnect();
                subtreeObs = null;
            }
        }

        // recalc for click area
        function attachClickHandler() {
            if (clickHandler) return;

            clickHandler = function (evt) {
                const target = evt.target;
                if (!target || !(target instanceof Element)) return;

                // wait for main changes
                $window.requestAnimationFrame(function () {
                    if (cfg.debug) console.debug('[bubbleTextService] click refresh around target');
                    refreshSubtree(target);
                });
            };

            document.addEventListener('click', clickHandler, false);
        }

        function detachClickHandler() {
            if (!clickHandler) return;
            document.removeEventListener('click', clickHandler, false);
            clickHandler = null;
        }

        function startAuto(options) {
            if (running) return;
            running = true;
            cfg = Object.assign({}, cfg, options);

            function safeInit() {
                $window.requestAnimationFrame(function () {
                    refreshAll();
                    // safety passes for late paints / async theme flips
                    $timeout(refreshAll, 100, false);
                    $timeout(refreshAll, 300, false);
                });
            }
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                safeInit();
            } else {
                document.addEventListener('DOMContentLoaded', safeInit, {
                    once: true
                });
            }

            // event hooks
            angular.element($window).on('resize', scheduleRefresh);
            document.addEventListener('pageshow', scheduleRefresh); // BFCache restore
            document.addEventListener('visibilitychange', function () {
                if (document.visibilityState === 'visible') scheduleRefresh();
            });
            document.addEventListener('ucsd:themechange', scheduleRefresh);

            // observers
            attachThemeObservers();
            watchForBodyReplacement();
            startPolling();
            startSubtreeObserver();
            attachClickHandler();
        }

        function stopAuto() {
            if (!running) return;
            running = false;

            angular.element($window).off('resize', scheduleRefresh);
            document.removeEventListener('pageshow', scheduleRefresh);
            document.removeEventListener('visibilitychange', scheduleRefresh);
            document.removeEventListener('ucsd:themechange', scheduleRefresh);

            if (raf) {
                $window.cancelAnimationFrame(raf);
                raf = null;
            }
            if (bodyObs) {
                bodyObs.disconnect();
                bodyObs = null;
            }
            if (htmlObs) {
                htmlObs.disconnect();
                htmlObs = null;
            }
            if (bodySwapObs) {
                bodySwapObs.disconnect();
                bodySwapObs = null;
            }
            stopPolling();
            stopSubtreeObserver();
            detachClickHandler();
        }

        return {
            startAuto,
            stopAuto,
            refreshAll
        };
    }]);

});