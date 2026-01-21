'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    
    module.factory('timeUtil', ['Luxon', (Luxon) => {
        return {
            formatDate: function(input, formatType, zone = 'local') {
                let luxonDate;
            
                if (Luxon.DateTime.isDateTime(input)) {
                    luxonDate = input;
                } else if (input instanceof Date) {
                    luxonDate = Luxon.DateTime.fromJSDate(input);
                } else if (typeof input === 'string') {
                    const s = input.trim();
                    if (s.includes('T')) {
                        // ISO-ish
                        luxonDate = Luxon.DateTime.fromISO(s);
                    } else {
                        // SQL-ish: "yyyy-MM-dd HH:mm:ss" (optionally with .SSS)
                        luxonDate = Luxon.DateTime.fromSQL(s);
                    }
                } else {
                    console.warn('Unsupported date input format:', input);
                    return null;
                }
            
                if (!luxonDate.isValid) {
                    console.warn('Invalid date after parsing:', luxonDate.invalidExplanation);
                    return null;
                }
            
                // Apply desired timezone
                luxonDate = luxonDate.setZone(zone);
            
                switch (formatType) {
                    case 'Luxon': return luxonDate;
                    case 'ISO': return luxonDate.toISO();
                    case 'JS': return luxonDate.toJSDate();
                    case 'Oracle': return luxonDate.toFormat('yyyy-MM-dd HH:mm:ss.SSS');
                    case 'yyyy-MM-dd': return luxonDate.toFormat('yyyy-MM-dd');
                    default:
                        console.warn('Unknown format type requested:', formatType);
                        return null;
                }
            }
        };
    }]);
});