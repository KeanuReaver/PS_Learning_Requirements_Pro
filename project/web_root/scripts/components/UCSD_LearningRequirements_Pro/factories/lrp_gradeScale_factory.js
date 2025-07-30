'use strict';
define(require => {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('gradeScaleOrg', ($q, getData, writeData) => {
        return {
            populateGradeScales: function() {
                return getData.getGradeScales()
                    .then(response => {
                        const promises = response.map(item => {
                            return getData.getGradeScaleItems(item.gradescaleitemid)
                                .then(scaleItems => {
                                    item.scaleItems = scaleItems.sort((a, b) => parseInt(b.gsivalue, 10) - parseInt(a.gsivalue, 10));
                                    return item;
                                });
                        });

                        return $q.all(promises);
                    })
                    .catch(error => {
                        throw error;
                    })
                    .finally(() => {
                        closeLoading();
                    });
            },
            organizeGradeScalePageData: function() {
                const gradeScalePromise = this.populateGradeScales();
                const schoolListPromise = getData.getSchoolList();
                const scoreColorListPromise = getData.getScoreColorList();
            
                return $q.all([gradeScalePromise, schoolListPromise, scoreColorListPromise])
                    .then(([gradeScales, schoolList, scoreColorList]) => {
                        // Map each gradeScale to add availableSchools
                        gradeScales.forEach(scale => {
                            const assignedSchools = scale.schools ? scale.schools.split(',') : [];
                            scale.availableSchools = schoolList.map(school => ({
                                school_number: school.school_number,
                                name: school.abbreviation,
                                selected: assignedSchools.includes(school.school_number.toString())
                            }));
                        });
                        return { gradeScales, schoolList, scoreColorList };
                    })
                    .catch(error => {
                        throw error;
                    });
            },
            filterSchoolList: function(schoolList, gradeScales) {
                return schoolList.filter(item => {
                    return !gradeScales.find(record => {
                        (record.schools) 
                            ? record.schools.includes(item.school_number.toString())
                            : false;
                    });
                })
            },
            submitChanges: function(gradeScales) {
                const promises = [];

                for (const item of gradeScales) {
                    const args = {
                        gradescaleid: item.gradescaleitemid,
                        schoolids: item.schools
                    }

                    promises.push(writeData.writeGradeScaleAssign(args, item.lrpid));
                }

                return $q.all(promises);
            }
        }
    });
});