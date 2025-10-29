'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.directive('mainViewAttendance', [function() {
        return {
            restrict: 'EA',
            scope: {
                curyearid: '=',
                portalAddress: '=',
                transTags: '='
            },
            templateUrl: '/scripts/components/UCSD_LearningRequirements_Pro/views/main/attendance_template.html',
            controller: ['$scope', 'getData', function($scope, getData) {
                $scope.att_data = [];
                $scope.cur_year_graph = {};       // you can use this later for ADA/ADM display
                $scope.month_compare_graph = {};  // FusionCharts config gets assigned here
                $scope.attBands = [];
                $scope.popup = {};
                $scope.yearAbbrById = {};
                $scope.currentBand = {};

                // safety: these are bound attributes; ensure they exist when used
                const chronic_lookup = {
                    '95': { label: 'No Risk',  color: 'green'  },
                    '90': { label: 'Low Risk', color: 'yellow' },
                    '85': { label: 'At Risk',  color: 'orange' },
                    '0':  { label: 'High Risk',color: 'red'    }
                };

                const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

                const SCHOOL_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];

// Map JS month index (0=Jan..11=Dec) -> school-year slot (0=Jul..11=Jun)
                const JS_TO_SCHOOL_POS = { 0:6, 1:7, 2:8, 3:9, 4:10, 5:11, 6:0, 7:1, 8:2, 9:3, 10:4, 11:5 };
                
                function toMonthIndex(dstr) {
                    try {
                        const d = new Date(dstr);
                        if (!isNaN(d.getTime())) return d.getMonth(); // 0..11 (JS)
                    } catch(e) {}
                    const m = String(dstr).match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})/);
                    return m ? (parseInt(m[2], 10) - 1) : null;
                }

                function hasUnexcused(categoriesCsv) {
                    if (!categoriesCsv) return false;
                    // categories are comma-delimited per your subquery
                    return categoriesCsv.split(',').map(s => s.trim().toLowerCase()).includes('unexcused');
                }

                function calcAdaAdmForYear(rows, targetYearId) {
                    // local YYYY-MM-DD (avoid UTC drift)
                    const todayStr = (() => {
                        const d = new Date();
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    })();
                
                    let attSum = 0; // Σ attendancevalue up to today
                    let memSum = 0; // Σ membershipvalue up to today
                
                    for (const r of rows) {
                        if (r.yearid !== targetYearId) continue;
                
                        // Expect 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss' — compare by YYYY-MM-DD string
                        const dstr = String(r.date_value || '').slice(0, 10);
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(dstr)) continue; // skip bad dates
                        if (dstr > todayStr) continue; // exclude future dates
                
                        const att = Number(r.attendancevalue) || 0;
                        const mem = Number(r.membershipvalue) || 0;
                        attSum += att;
                        memSum += mem;
                    }
                
                    // console.log('[ADA/ADM up to today]', { attSum, memSum, todayStr });
                    return memSum > 0 ? (attSum / memSum) : null;
                }

                function buildMonthlyAbsencesIndex(rows) {
                    // perYear[yearid][slot] = { unexcused: N, other: N }
                    const perYear = {};
                    // absIndex[yearid][slot] = [ { date, unexcused, desc } ... ]
                    const absIndex = {};
                    // yearAbbrById[yearid] = "24-25"
                    const yearAbbrById = {};
                
                    for (const r of rows) {
                        // trust the query to give year_abbr like "24-25"
                        if (r.yearid != null && r.year_abbr) yearAbbrById[r.yearid] = r.year_abbr;
                
                        const jsMonth = toMonthIndex(r.date_value);
                        if (jsMonth == null) continue;
                        const slot = JS_TO_SCHOOL_POS[jsMonth];
                        const yearid = r.yearid;
                
                        perYear[yearid] ||= Array.from({ length: 12 }, () => ({ unexcused: 0, other: 0 }));
                        absIndex[yearid] ||= Array.from({ length: 12 }, () => []);
                
                        let dayCodes = [];
                        if (r.day_codes_json) {
                            try {
                                dayCodes = (typeof r.day_codes_json === 'string')
                                    ? JSON.parse(r.day_codes_json)
                                    : r.day_codes_json;
                            } catch (e) { dayCodes = []; }
                        }
                
                        for (const item of dayCodes) {
                            const pres = String(item.presence_status || item.presence_status_cd || '').toLowerCase();
                            if (pres === 'absent') {
                                const unx = hasUnexcused(item.categories);
                                if (unx) perYear[yearid][slot].unexcused += 1;
                                else     perYear[yearid][slot].other     += 1;
                
                                absIndex[yearid][slot].push({
                                    date: r.date_value,
                                    unexcused: !!unx,
                                    desc: item.categories || item.code || item.attendance_code || 'Absent'
                                });
                            }
                        }
                    }
                    
                    // console.log('perYear', perYear);
                    return { perYear, absIndex, yearAbbrById };
                }
                
                function addYearAnnotations(cfg) {
                    const items = [];
                    // For each stack (year) and each month, place a vertical label at the bottom
                    // We anchor to the TOP segment ("Excused") so use series index 1 inside each stack.
                    // Macro key pattern for msstackedcolumn2d:
                    //   $stack.<stackIdx>.dataset.1.set.<monthIdx>.x
                    //   $canvasbottom gives the baseline
                    cfg._yearsAsc.forEach((y, stackIdx) => {
                        const yName = toYearName(y);
                        for (let mi = 0; mi < SCHOOL_MONTHS.length; mi++) {
                            items.push({
                                id: `ylab_${stackIdx}_${mi}`,
                                type: 'text',
                                text: yName,
                                // X centered at this bar (top segment of the stack)
                                x: `$stack.${stackIdx}.dataset.1.set.${mi}.x`,
                                // Slightly above x-axis labels
                                y: '$canvasbottom-14',
                                // vertical text
                                rotate: '90',
                                align: 'middle',
                                valign: 'bottom',
                                color: ($scope.fcTheme === 'candy') ? '#D0D0D0' : '#606060',
                                fontSize: '9',
                                bold: '0'
                            });
                        }
                    });
                
                    const anno = cfg.dataSource.annotations?.groups?.find(g => g.id === 'yearLabels');
                    if (anno) anno.items = items;
                }

                const RED = '#D32F2F'; // Unexcused
                const AMB = '#DA7516'; // Excused (amber works in light & dark)
                
                function attLink(yearId, slot) {
                    // slot 0..11 = Jul..Jun
                    // start YY is the first part of "YY-YY"
                    const abbr = $scope.yearAbbrById[yearId]; // e.g., "24-25"
                    // fallback: derive from id if missing (shouldn’t happen once query includes year_abbr)
                    const startYY = abbr ? parseInt(abbr.split('-')[0], 10) : (yearId - 10);
                    const startYear = 2000 + startYY;
                
                    const isJulToDec = slot <= 5;          // 0..5 -> Jul..Dec of startYear
                    const year  = isJulToDec ? startYear : (startYear + 1);
                    const month = isJulToDec ? (7 + slot)  // 7..12
                                             : (slot - 5); // 1..6
                    const pad2 = n => String(n).padStart(2, '0');
                    const monthKey = `${year}-${pad2(month)}`; // e.g., "2025-09"
                    return `j-showAbsences-${monthKey}`;
                }
                
                function buildMsStackedConfig(perYear) {
                    const categories = [{ category: SCHOOL_MONTHS.map(lbl => ({ label: lbl })) }];
                    const yearsAsc = Object.keys(perYear).map(Number).sort((a,b) => a - b); // oldest -> newest
                
                    const dataset = yearsAsc.map((y) => {
                        const months = perYear[y];
                        const yName  = $scope.yearAbbrById[y] || ''; // <-- use year_abbr directly
                        // console.log('Months:', months);
                        return {
                            dataset: [
                                {
                                    seriesname: 'Unexcused',
                                    color: RED,
                                    showvalues: '0',
                                    data: months.map((m, mi) => {
                                        // console.log(m);
                                        // console.log(mi);
                                        return {
                                            value: String(m.unexcused || 0),
                                            link: attLink(y, mi),
                                            tooltext: `${yName} • Unexcused • ${SCHOOL_MONTHS[mi]}: <b>${m.unexcused || 0}</b>`
                                        }
                                    })
                                },
                                {
                                    seriesname: 'Excused',
                                    color: AMB,
                                    showvalues: '1',       // show the label (year) on this series
                                    rotatevalues: '90',    // vertical year text
                                    placevaluesinside: '0',
                                    valuepadding: '14',
                                    data: months.map((m, mi) => ({
                                        value: String(m.other || 0),
                                        displayvalue: yName,   // <-- vertical year tag (from query)
                                        link: attLink(y, mi),
                                        tooltext: `${yName} • Excused • ${SCHOOL_MONTHS[mi]}: <b>${m.other || 0}</b>`
                                    }))
                                }
                            ]
                        };
                    });
                    // console.log(dataset);
                    return {
                        type: 'msstackedcolumn2d',
                        width: '100%',
                        height: '460',
                        dataFormat: 'json',
                        dataSource: {
                            chart: {
                                theme: $scope.fcTheme || 'fusion',
                                showvalues: '0',          // globally hide; top series overrides for year labels
                                drawcrossline: '1',
                                xaxisname: 'Month',
                                yaxisname: 'Absence Count (periods)',
                                showlegend: '0',
                                legendposition: 'bottom',
                                manageValueOverlapping: '1',
                                valuefontbold: '0',
                                valuefontsize: '10',
                                plottooltext: ''
                            },
                            categories,
                            dataset
                        },
                        _yearsAsc: yearsAsc
                    };
                }
                
                window.showAbsences = function(arg) {
                    const clean = String(arg || '').replace(/^j-showAbsences-/, '');
                    if (/^\d{4}-\d{2}$/.test(clean)) {
                        $scope.$applyAsync(() => openMonthByKey(clean));
                    }
                };

                
                $scope.popup = { open: false, title: '', items: [], yearId: null, slot: null };
                
                function openAbsences(yearId, slot) {
                    const items = ($scope.absIndex?.[yearId]?.[slot]) || [];
                    $scope.popup.open   = true;
                    $scope.popup.yearId = yearId;
                    $scope.popup.slot   = slot;
                    $scope.popup.title  = `Absences — ${toYearName(yearId)} • ${SCHOOL_MONTHS[slot]}`;
                    // sort by date ascending (optional)
                    $scope.popup.items  = items.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
                }
                
                function openMonthByKey(monthKey) {
                    // Pull all records for that month (safe string prefix match; avoids timezone issues)
                    const monthRows = ($scope.att_data || []).filter(r =>
                        typeof r.date_value === 'string' && r.date_value.slice(0, 7) === monthKey
                    );
                
                    // Expand each row's day_codes_json into ONE list item per absent PERIOD
                    const items = [];
                    for (const r of monthRows) {
                        let codes = [];
                        try {
                            codes = typeof r.day_codes_json === 'string'
                                ? JSON.parse(r.day_codes_json)
                                : (r.day_codes_json || []);
                        } catch (e) {
                            codes = [];
                        }
                
                        for (const c of (codes || [])) {
                            const presence = String(c.presence_status || c.presence_status_cd || '').toLowerCase();
                            if (presence !== 'absent') continue; // only absent rows
                
                            items.push({
                                // from record
                                date: r.date_value, // <- outside day_codes_json
                                // from item (with robust fallbacks)
                                att_code: c.att_code || c.attendance_code || c.code || '',
                                categories: c.categories || '',
                                course_name: c.course_name || c.section_course_name || '',
                                course_number: c.course_number || c.section_course_number || c.coursenumber || '',
                                period: c.period || c.period_number || c.periodid || '',
                                presence_status: c.presence_status || c.presence_status_cd || ''
                            });
                        }
                    }
                
                    // Sort date asc, then period asc (numeric-ish)
                    items.sort((a, b) => {
                        const d = a.date.localeCompare(b.date);
                        if (d) return d;
                        const ap = isNaN(+a.period) ? String(a.period) : +a.period;
                        const bp = isNaN(+b.period) ? String(b.period) : +b.period;
                        return ap < bp ? -1 : ap > bp ? 1 : 0;
                    });
                
                    $scope.popup.open  = true;
                    $scope.popup.title = `Absences — ${monthKey}`;
                    $scope.popup.items = items;
                }
                
                function currentStartTwoDigitYY() {
                    // School year starts in July/Aug (use July cutoff)
                    const now = new Date();
                    const startYear = (now.getMonth() >= 6) ? now.getFullYear() : (now.getFullYear() - 1);
                    return startYear % 100; // two-digit
                }
                
                function toYearName(yearId) {
                    const pad2 = n => n.toString().padStart(2, '0');
                    const mod100 = n => ((n % 100) + 100) % 100;
                    return `${pad2(mod100(yearId - 10))}-${pad2(mod100(yearId - 9))}`;
                }
                
                $scope.getYearName = (id) => toYearName(id);
                
                function getThemeFromBody() {
                    const cls = document.body.className || '';
                    // if body class contains "set-to-dark" => use "candy" (dark), else "fusion" (light)
                    return /\bset-to-dark\b/.test(cls) ? 'candy' : 'fusion';
                }
                
                function getCurrentBand(val) {
                    return $scope.attBands.find(rec => rec.bottom_band < val && rec.top_band >= val) || $scope.attBands.find(rec => rec.default_band == 1);
                }

                function populateAttendance() {
                    if (!$scope.curyearid || !$scope.portalAddress) return;

                    const att_url = `${$scope.portalAddress}attendance.json?start_year_id=${$scope.curyearid - 2}`;
                    const band_url = `${$scope.portalAddress}attBandList.json`;
                    
                    getData.getTList(band_url)
                        .then(response => response || [])
                        .then(data => {
                            $scope.attBands = data;
                            console.log($scope.attBands);
                        })
                        .catch(error => {
                            console.error('Failed to get attendance bands:', error);
                        });

                    getData.getTList(att_url)
                        .then(rows => rows || [])
                        .then(rows => {
                            for (const r of rows) r.yearid = Number(r.yearid);
                            $scope.att_data = rows;
                            // console.log($scope.att_data);
                        
                            const { perYear, absIndex, yearAbbrById } = buildMonthlyAbsencesIndex(rows);
                            $scope.absIndex = absIndex;
                            $scope.yearAbbrById = yearAbbrById;   // <-- use this everywhere
                        
                            $scope.month_compare_graph = buildMsStackedConfig(perYear);
                            $scope.graphType = $scope.month_compare_graph.type;
                            $scope.graphData = $scope.month_compare_graph.dataSource;
                        
                            // ADA/ADM (unchanged)
                            const maxYear = rows.reduce((mx, r) => Math.max(mx, r.yearid || 0), 0);
                            const adaadm = calcAdaAdmForYear(rows, maxYear);
                            $scope.cur_year_graph = {
                                yearid: maxYear,
                                adaadm_ratio: adaadm,
                                adaadm_percent: adaadm != null ? (adaadm * 100) : null
                            };
                            $scope.thermoValue = $scope.cur_year_graph.adaadm_percent != null
                                ? Math.round($scope.cur_year_graph.adaadm_percent)
                                : null;
                            $scope.currentBand = getCurrentBand($scope.thermoValue) || {};
                            $scope.$apply();
                        })
                        .catch(err => {
                            console.error('Attendance load error:', err);
                            $scope.att_data = [];
                            $scope.month_compare_graph = {};
                            $scope.cur_year_graph = {};
                        });
                }
                
                $scope.fcTheme = getThemeFromBody();
                
                $scope.fcEvents = {
                    dataplotclick: function(ev, args) {
                        const rawLink = (args?.data?.link) || (args?.dataObj?.link) || args?.link || '';
                        if (rawLink.startsWith('j-showAbsences-')) {
                            const key = rawLink.substring('j-showAbsences-'.length);
                            if (/^\d{4}-\d{2}$/.test(key)) {
                                $scope.$applyAsync(() => openMonthByKey(key));
                            }
                        }
                    }
                };
                
                $scope.bandTextColor = function(hex) {
                    // return '#000' or '#fff' for contrast with background hex
                    if (!hex || typeof hex !== 'string') return '#111';
                    const m = hex.replace('#','').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
                    if (!m) return '#111';
                    let r,g,b;
                    if (m[1].length === 3){
                        r = parseInt(m[1][0]+m[1][0],16);
                        g = parseInt(m[1][1]+m[1][1],16);
                        b = parseInt(m[1][2]+m[1][2],16);
                    } else {
                        r = parseInt(m[1].slice(0,2),16);
                        g = parseInt(m[1].slice(2,4),16);
                        b = parseInt(m[1].slice(4,6),16);
                    }
                    // W3C relative luminance
                    const lum = (0.2126*r + 0.7152*g + 0.0722*b);
                    return lum > 140 ? '#111' : '#fff';
                };

                // React to body class changes
                const bodyObserver = new MutationObserver(() => {
                    const newTheme = getThemeFromBody();
                    if ($scope.fcTheme !== newTheme) {
                        $scope.fcTheme = newTheme;
                        // Update chart theme and trigger a digest so FusionCharts re-renders
                        if ($scope.month_compare_graph?.dataSource?.chart) {
                            $scope.month_compare_graph.dataSource.chart.theme = newTheme;
                            $scope.$applyAsync(); // let angular/fc-angular update the chart
                        }
                    }
                });
                bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
                
                // Clean up when directive is destroyed
                $scope.$on('$destroy', () => bodyObserver.disconnect());

                // ensure we actually *call* it on ready
                // (your previous code had a function reference but didn’t invoke it)
                // Also re-run if curyearid changes dynamically.
                $scope.$watchGroup(['curyearid', 'portalAddress'], function(vals) {
                    if (vals && vals[0] && vals[1]) {
                        populateAttendance();
                    }
                });

                // jQuery doc ready (optional, the $watch above is usually enough)
                // $j(function() {
                //     if ($scope.curyearid && $scope.portalAddress) {
                //         populateAttendance();
                //     }
                // });
            }]
        }
    }]);
});