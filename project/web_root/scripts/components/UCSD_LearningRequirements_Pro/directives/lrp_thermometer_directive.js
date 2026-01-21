'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.directive('lrpThermometerBar', [function() {
        return {
            restrict: 'E',
            scope: {
                bands: '=',         
                value: '=',         
                defaultColor: '@?', 
                height: '@?',       
                showLabels: '@?',   
                labelProp: '@?',
                lowProp: '@?',
                highProp: '@?',
                colorProp: '@?'
            },
            template: [
                '<div class="lrp-thermo-root" role="img" aria-label="{{a11yLabel}}">',
                '  <div class="lrp-thermo-wrapper">',
            
                '    <!-- Row 1: Arrow track above the bar -->',
                '    <div class="lrp-thermo-arrow-row" ng-style="{ height: arrowRowPx }">',
                '      <div class="lrp-thermo-arrow" ng-style="{ left: arrowLeftPct + \'%\' }" aria-hidden="true">',
                '        <div class="lrp-thermo-value">{{displayValue}}%</div>',
                '        <div class="lrp-thermo-tip"></div>',
                '      </div>',
                '    </div>',
            
                '    <!-- Row 2: Horizontal bar split into color bands -->',
                '    <div class="lrp-thermo-bar" ng-style="{ height: barPxHeight }">',
                '      <div class="lrp-thermo-seg" ng-repeat="seg in segments"',
                '           ng-style="{ width: seg.pct + \'%\', background: seg.color }"',
                '           title="{{seg.title}}"></div>',
                '    </div>',
            
                '  </div>',
            
                '  <!-- Row 3: Band labels below the bar -->',
                '  <div class="lrp-thermo-labels" ng-if="showLabelsBool">',
                '    <div class="lrp-thermo-label" ng-repeat="seg in segments" ng-style="{ width: seg.pct + \'%\' }">',
                '      <span class="lrp-thermo-label-chip" ng-style="{ background: seg.color }"></span>',
                '      <span class="lrp-thermo-label-text">{{seg.label}}</span>',
                '      <span class="lrp-thermo-label-range" ng-if="seg.label || seg.isGap">{{seg.low}}–{{seg.high}}</span>',
                '    </div>',
                '  </div>',
            
                '</div>'
            ].join(''),
            link: function(scope) {
                const DEFAULTS = {
                    defaultColor: '#e5e7eb',
                    height: 24,
                    labelProp: 'label',
                    lowProp: 'bottom_band',
                    highProp: 'top_band',
                    colorProp: 'colorcode'
                };

                function num(n) { const v = Number(n); return Number.isFinite(v) ? v : null; }
                function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
                function asBool(str) { return String(str).toLowerCase() === 'true'; }

                function deriveRange(bands, kLow, kHigh) {
                    let lo = null, hi = null;
                    (bands || []).forEach(b => {
                        const bl = num(b?.[kLow]);  const bh = num(b?.[kHigh]);
                        if (bl === null || bh === null) return;
                        lo = (lo === null) ? bl : Math.min(lo, bl);
                        hi = (hi === null) ? bh : Math.max(hi, bh);
                    });
                    // Fallback if bands are empty/invalid
                    if (lo === null || hi === null || hi <= lo) return { min: 0, max: 100, fallback: true };
                    return { min: lo, max: hi, fallback: false };
                }

                function normalizeBands(range) {
                    const { min, max } = range;
                    const kLabel = scope.labelProp || DEFAULTS.labelProp;
                    const kLow   = scope.lowProp   || DEFAULTS.lowProp;
                    const kHigh  = scope.highProp  || DEFAULTS.highProp;
                    const kColor = scope.colorProp || DEFAULTS.colorProp;

                    const out = [];
                    (scope.bands || []).forEach(b => {
                        if (!b) return;
                        const low  = num(b[kLow]);
                        const high = num(b[kHigh]);
                        if (low === null || high === null) return;
                        if (high <= min || low >= max) return; // out of derived range
                        out.push({
                            label: (b[kLabel] || '').trim(),
                            low: clamp(low, min, max),
                            high: clamp(high, min, max),
                            color: b[kColor] || scope.defaultColor || DEFAULTS.defaultColor
                        });
                    });

                    // sort then defensively merge any overlaps for clean display
                    out.sort((a, b) => (a.low - b.low) || (a.high - b.high));
                    const merged = [];
                    for (const seg of out) {
                        if (!merged.length) {
                            merged.push(seg);
                        } else {
                            const last = merged[merged.length - 1];
                            if (seg.low < last.high) {
                                last.high = Math.max(last.high, seg.high);
                                // keep last.label/color policy
                            } else {
                                merged.push(seg);
                            }
                        }
                    }
                    return merged;
                }

                function buildSegments(range) {
                    const { min, max } = range;
                    const fallback = scope.defaultColor || DEFAULTS.defaultColor;
                    const raw = normalizeBands(range);

                    const segs = [];
                    let cursor = min;

                    for (const b of raw) {
                        if (b.low > cursor) {
                            segs.push({
                                low: cursor, high: b.low,
                                pct: (b.low - cursor) * 100 / (max - min),
                                color: fallback,
                                label: '',
                                isGap: true,
                                title: `${cursor}–${b.low}`
                            });
                        }
                        segs.push({
                            low: b.low, high: b.high,
                            pct: (b.high - b.low) * 100 / (max - min),
                            color: b.color,
                            label: b.label,
                            isGap: false,
                            title: (b.label ? `${b.label}: ` : '') + `${b.low}–${b.high}`
                        });
                        cursor = b.high;
                    }

                    if (cursor < max) {
                        segs.push({
                            low: cursor, high: max,
                            pct: (max - cursor) * 100 / (max - min),
                            color: fallback,
                            label: '',
                            isGap: true,
                            title: `${cursor}–${max}`
                        });
                    }

                    scope.segments = segs;
                }

                function positionArrow(range) {
                    const { min, max } = range;
                    const rawVal = num(scope.value);
                    // where to *place* the arrow:
                    const placement = (rawVal === null) ? min : clamp(rawVal, min, max);
                    // but *display* the true value (even if out-of-range)
                    scope.displayValue = (rawVal === null) ? '' : Math.round(rawVal);
                    scope.arrowLeftPct = ((placement - min) / (max - min)) * 100;
                }

                function updateA11y(range) {
                    const { min, max } = range;
                    const v = num(scope.value);
                    const bandsDesc = (scope.segments || [])
                        .filter(s => s.label && !s.isGap)
                        .map(s => `${s.label} ${s.low}–${s.high}`)
                        .join('; ');
                    scope.a11yLabel = `Thermometer from ${min} to ${max}. ` +
                        (bandsDesc ? `Bands: ${bandsDesc}. ` : '') +
                        (Number.isFinite(v) ? `Value: ${Math.round(v)}.` : '');
                }

                function render() {
                    const barH = Number(scope.height || 16);   // your existing default
                    scope.barPxHeight = `${barH}px`;
                    
                    // Arrow row height controls how “high” the arrow sits above the bar
                    const bubbleH = 20;  // ~value bubble height in px
                    const tipH    = 6;   // triangle height
                    const gap     = 6;   // whitespace under bubble
                    scope.arrowRowPx = `${bubbleH + tipH + gap}px`;
                    
                    scope.showLabelsBool = asBool(scope.showLabels);
                    
                    const kLow  = scope.lowProp   || 'bottom_band';
                    const kHigh = scope.highProp  || 'top_band';
                    const range = deriveRange(scope.bands, kLow, kHigh);
                    
                    buildSegments(range);
                    positionArrow(range);   // still sets arrowLeftPct and displayValue
                    updateA11y(range);
                }


                scope.$watchGroup(
                    ['bands','value','defaultColor','height','showLabels','labelProp','lowProp','highProp','colorProp'],
                    render
                );

                render();
            }
        };
    }]);
});