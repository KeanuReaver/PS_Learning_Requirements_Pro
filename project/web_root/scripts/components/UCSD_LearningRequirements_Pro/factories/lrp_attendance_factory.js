'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('attLogic', [() => {
        // const SCHOOL_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
        const JS_TO_SCHOOL_POS = { 0:6, 1:7, 2:8, 3:9, 4:10, 5:11, 6:0, 7:1, 8:2, 9:3, 10:4, 11:5 };
        // const RED = '#D32F2F';
        // const AMB = '#DA7516';
        // let fcTheme = getThemeFromBody();

        function buildMonthlyAbsencesIndex(rows) {
            const perYear = {};
            const absIndex = {};
            const yearAbbrById = {};

            for (const r of rows) {
                if (r.yearid != null && r.year_abbr) yearAbbrById[r.yearid] = r.year_abbr;

                const jsMonth = toMonthIndex(r.date_value);
                if (jsMonth === null) continue;
                const slot = JS_TO_SCHOOL_POS(jsMonth);
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
            
            return { perYear, absIndex, yearAbbrById };
        }

        function hasUnexcused(categoriesCsv) {
            if (!categoriesCsv) return false;
            // categories are comma-delimited per your subquery
            return categoriesCsv.split(',').map(s => s.trim().toLowerCase()).includes('unexcused');
        }

        function attLink(yearId, slot, yearAbbrById) {
            const abbr = yearAbbrById[yearId];

            const startYY = abbr ? parseInt(abbr.split('-')[0], 10) : (yearId - 10);
            const startYear = 2000 + startYY;
        
            const isJulToDec = slot <= 5;
            const year  = isJulToDec ? startYear : (startYear + 1);
            const month = isJulToDec ? (7 + slot)
                                        : (slot - 5);
            const pad2 = n => String(n).padStart(2, '0');
            const monthKey = `${year}-${pad2(month)}`;
            return `j-showAbsences-${monthKey}`;
        }

        function getThemeFromBody() {
            const cls = document.body.className || '';
            return /\bset-to-dark\b/.test(cls) ? 'candy' : 'fusion';
        }

        // function buildMsStackedConfig(perYear, yearAbbrById) {
        //     const categories = [{ category: SCHOOL_MONTHS.map(lbl => ({ label: lbl })) }];
        //     const yearsAsc = Object.keys(perYear).map(Number).sort((a,b) => a - b); // oldest -> newest
        
        //     const dataset = yearsAsc.map((y) => {
        //         const months = perYear[y];
        //         const yName  = yearAbbrById[y] || ''; // <-- use year_abbr directly
        //         // console.log('Months:', months);
        //         return {
        //             dataset: [
        //                 {
        //                     seriesname: 'Unexcused',
        //                     color: RED,
        //                     showvalues: '0',
        //                     data: months.map((m, mi) => {
        //                         // console.log(m);
        //                         // console.log(mi);
        //                         return {
        //                             value: String(m.unexcused || 0),
        //                             link: attLink(y, mi),
        //                             tooltext: `${yName} • Unexcused • ${SCHOOL_MONTHS[mi]}: <b>${m.unexcused || 0}</b>`
        //                         }
        //                     })
        //                 },
        //                 {
        //                     seriesname: 'Excused',
        //                     color: AMB,
        //                     showvalues: '1',       // show the label (year) on this series
        //                     rotatevalues: '90',    // vertical year text
        //                     placevaluesinside: '0',
        //                     valuepadding: '14',
        //                     data: months.map((m, mi) => ({
        //                         value: String(m.other || 0),
        //                         displayvalue: yName,   // <-- vertical year tag (from query)
        //                         link: attLink(y, mi),
        //                         tooltext: `${yName} • Excused • ${SCHOOL_MONTHS[mi]}: <b>${m.other || 0}</b>`
        //                     }))
        //                 }
        //             ]
        //         };
        //     });
        //     // console.log(dataset);
        //     return {
        //         type: 'msstackedcolumn2d',
        //         width: '100%',
        //         height: '460',
        //         dataFormat: 'json',
        //         dataSource: {
        //             chart: {
        //                 theme: fcTheme || 'fusion',
        //                 showvalues: '0',          // globally hide; top series overrides for year labels
        //                 drawcrossline: '1',
        //                 xaxisname: 'Month',
        //                 yaxisname: 'Absence Count (periods)',
        //                 showlegend: '0',
        //                 legendposition: 'bottom',
        //                 manageValueOverlapping: '1',
        //                 valuefontbold: '0',
        //                 valuefontsize: '10',
        //                 plottooltext: ''
        //             },
        //             categories,
        //             dataset
        //         },
        //         _yearsAsc: yearsAsc
        //     };
        // }
        
        function attachAbsencesToClasses(classList, absData, attBands, current) {
            if (!Array.isArray(classList)) return classList;
            
            const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
            
            const rows = (absData || [])
                .filter(r => r && r.yearid == current && Array.isArray(r.day_codes_json) && r.day_codes_json.length > 0);
            
            const byCourse = new Map();
            for (const row of rows) {
                for (const abs of row.day_codes_json) {
                    const key = norm(abs.course_name);
                    abs.date_value = row.date_value;
                    if (abs.categories) abs.categories = abs.categories.split(',');
                    if (!byCourse.has(key)) byCourse.set(key, []);
                    byCourse.get(key).push(abs);
                }
            }
            
            for (const cls of classList) {
                if (!cls || !cls.attendance || typeof cls.attendance !== 'object') continue;
                
                const list = byCourse.get(norm(cls.course_name)) || [];
                
                const absences = [];
                const tardies = [];
                const present = [];
                
                for (const rec of list) {
                    const status = (rec.presence_status || '').trim();
                    if (status === 'Absent') {
                        rec.type = 'Absent';
                        absences.push(rec);
                    } else if (status === 'Present') {
                        if ((rec.categories && rec.categories.some(cat => cat === 'Tardy')) || (rec.att_code && rec.att_code === 'LE')) {
                            rec.type = 'Tardy';
                            tardies.push(rec);
                        } else {
                            rec.type = 'Present'
                            present.push(rec);
                        }
                    }
                }
                
                cls.attendance.absences = absences;
                cls.attendance.tardies = tardies;
                cls.attendance.present = present;
                
                const meetings = Number(cls.attendance.meetings) || 0;
                cls.attendance.rate = meetings > 0 && meetings > absences.length ? Math.round(((meetings - absences.length) / meetings) * 1000) / 10 : 0;
                cls.attendance.alpha = cls.attendance.rate ? getCurrentBand(cls.attendance.rate, attBands) : null;
            }
        
            return classList;
        }

        function toMonthIndex(dstr) {
            try {
                const d = new Date(dstr);
                if (!isNaN(d.getTime())) return d.getMonth(); // 0..11 (JS)
            } catch(e) {}
            const m = String(dstr).match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})/);
            return m ? (parseInt(m[2], 10) - 1) : null;
        }

        function calcAdaAdmForYear(attData, maxYear) {
            const todayStr = (() => {
                const d = new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            })();

            let attSum = 0;
            let memSum = 0;

            for (const r of attData) {
                if (r.yearid !== maxYear) continue;
                const dstr = String(r.date_value || '').slice(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dstr)) continue;
                if (dstr > todayStr) continue;

                const att = Number(r.attendancevalue) || 0;
                const mem = Number(r.membershipvalue) || 0;
                attSum += att;
                memSum += mem;
            }

            return memSum > 0 ? (attSum / memSum) : null;
        }

        function getCurrentBand(val, bands) {
            return bands.find(rec => rec.bottom_band < val && rec.top_band >= val) || bands.find(rec => rec.default_band == 1);
        }

        function populateMonthlyGraph(rows) {
            const { perYear, absIndex, yearAbbrById } = buildMonthlyAbsencesIndex(rows);
        
            const month_compare_graph = buildMsStackedConfig(perYear, yearAbbrById);
            const graphType = month_compare_graph.type;
            const graphData = month_compare_graph.dataSource;

            return { month_compare_graph, graphType, graphData };
        }

        function getBandTextColor(hex) {
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
        }

        // window.showAbsences = function(arg) {
        //     const clean = String(arg || '').replace(/^j-showAbsences-/, '');
        //     if (/^\d{4}-\d{2}$/.test(clean)) {
        //         $scope.$applyAsync(() => openMonthByKey(clean));
        //     }
        // };

        
        // $scope.popup = { open: false, title: '', items: [], yearId: null, slot: null };

        // function openAbsences(yearId, slot) {
        //     const items = ($scope.absIndex?.[yearId]?.[slot]) || [];
        //     $scope.popup.open   = true;
        //     $scope.popup.yearId = yearId;
        //     $scope.popup.slot   = slot;
        //     $scope.popup.title  = `Absences — ${toYearName(yearId)} • ${SCHOOL_MONTHS[slot]}`;
        //     // sort by date ascending (optional)
        //     $scope.popup.items  = items.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
        // }

        // function openMonthByKey(monthKey) {
        //     // Pull all records for that month (safe string prefix match; avoids timezone issues)
        //     const monthRows = ($scope.attData || []).filter(r =>
        //         typeof r.date_value === 'string' && r.date_value.slice(0, 7) === monthKey
        //     );
        
        //     // Expand each row's day_codes_json into ONE list item per absent PERIOD
        //     const items = [];
        //     for (const r of monthRows) {
        //         let codes = [];
        //         try {
        //             codes = typeof r.day_codes_json === 'string'
        //                 ? JSON.parse(r.day_codes_json)
        //                 : (r.day_codes_json || []);
        //         } catch (e) {
        //             codes = [];
        //         }
        
        //         for (const c of (codes || [])) {
        //             const presence = String(c.presence_status || c.presence_status_cd || '').toLowerCase();
        //             if (presence !== 'absent') continue; // only absent rows
        
        //             items.push({
        //                 // from record
        //                 date: r.date_value, // <- outside day_codes_json
        //                 // from item (with robust fallbacks)
        //                 att_code: c.att_code || c.attendance_code || c.code || '',
        //                 categories: c.categories || '',
        //                 course_name: c.course_name || c.section_course_name || '',
        //                 course_number: c.course_number || c.section_course_number || c.coursenumber || '',
        //                 period: c.period || c.period_number || c.periodid || '',
        //                 presence_status: c.presence_status || c.presence_status_cd || ''
        //             });
        //         }
        //     }
        
        //     // Sort date asc, then period asc (numeric-ish)
        //     items.sort((a, b) => {
        //         const d = a.date.localeCompare(b.date);
        //         if (d) return d;
        //         const ap = isNaN(+a.period) ? String(a.period) : +a.period;
        //         const bp = isNaN(+b.period) ? String(b.period) : +b.period;
        //         return ap < bp ? -1 : ap > bp ? 1 : 0;
        //     });
        
        //     $scope.popup.open  = true;
        //     $scope.popup.title = `Absences — ${monthKey}`;
        //     $scope.popup.items = items;
        // }

        // $scope.fcEvents = {
        //     dataplotclick: function(ev, args) {
        //         const rawLink = (args?.data?.link) || (args?.dataObj?.link) || args?.link || '';
        //         if (rawLink.startsWith('j-showAbsences-')) {
        //             const key = rawLink.substring('j-showAbsences-'.length);
        //             if (/^\d{4}-\d{2}$/.test(key)) {
        //                 $scope.$applyAsync(() => openMonthByKey(key));
        //             }
        //         }
        //     }
        // };

        return {
            buildMonthlyAbsencesIndex,
            calcAdaAdmForYear,
            getCurrentBand,
            getBandTextColor,
            populateMonthlyGraph,
            getThemeFromBody,
            attachAbsencesToClasses
        }
    }]);
});