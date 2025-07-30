define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('getTrend', (arrowIcons) => {
        return {
            calculateLinearRegression: function(assignments) {
                const filteredAssignments = assignments.filter(item => item.percent !== null && item.percent !== undefined && item.percent !== '') // Filter out items with null or undefined percent
                .map(item => ({
                    date: new Date(item.due_date),
                    score: item.score,
                    percent: parseFloat(item.percent),
                    label: item.due_date,
                    color: item.color
                }))
                .sort((a, b) => a.date - b.date);

                return filteredAssignments.length > 1 ? this.getSlope(filteredAssignments) : null;
            },
            getSlope: function(filteredAssignments) {
                return linearRegression = this.linearRegression(filteredAssignments);
            },
            linearRegression: function (parsedData) {
                const n = parsedData.length;
                const xValues = parsedData.map((_, index) => index + 1); // Sequential indices as x values
                const yValues = parsedData.map(item => item.percent); // Percent as y values
    
                const sumX = xValues.reduce((acc, x) => acc + x, 0);
                const sumY = yValues.reduce((acc, y) => acc + y, 0);
                const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
                const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    
                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            
                return slope;
            },
            checkTrend: function(trend) {
                if (isNaN(trend)) {
                    return null;
                }

                return trend > 0 
                    ? arrowIcons.greenArrow 
                    : trend < 0 
                        ? arrowIcons.redArrow 
                        : arrowIcons.bar;
            },
            arrowRotation: function(trend, filter = 'brightness(1)', height = '3rem', fontSize = null) {
                const styleObj = {
                    'height': height,
                    'filter': filter
                };

                if (fontSize) {
                    styleObj['font-size'] = fontSize;
                }

                if (!isNaN(trend)) {
                    const styleValue = trend > 0 ? (1 - trend) * 90 : trend < 0 ? -(1 + trend) * 90 : 90;
                    styleObj['transform'] = `rotate(${styleValue}deg)`;
                }
                return styleObj;
            }
        }
    });
});