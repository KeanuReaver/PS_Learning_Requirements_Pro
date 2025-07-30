'use strict';
define([
    'angular',
    'components/shared/index',
    'components/angular_libraries/sortable',
    'components/angular_libraries/fusionChartsModule',
    'components/angular_libraries/ucsdBetterAnimations',
    'components/angular_libraries/mobileModule',
    'components/angular_libraries/utilitiesModule',
    'components/angular_libraries/luxonModule'
], function(angular) {
    return angular.module('lrpmodule', [
            'powerSchoolModule',
            'ngSanitize',
            'ui.sortable',
            'ng-fusioncharts', // Provided by our fusionChartsModule
            'ngAnimate',
            'utilityLibraries',
            'luxonModule'
        ])
        .constant('default_headers', {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        .constant('arrowIcons', {
                greenArrow: "/images/dist/teacher_tools/images/icons/improve-green-30x30.svg",
                redArrow: "/images/dist/teacher_tools/images/icons/decline-red-30x30.svg",
                bar: "/images/img/frame-menu-top-bar.png"
            }
        )
        .constant('classListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.proLrngReq.classlist.flat?pagesize=0')
        .constant('stdListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.stdList.flat?pagesize=0')
        .constant('asmtListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.asmtList.flat?pagesize=0')
        .constant('commentListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.comments.flat?pagesize=0')
        .constant('studentTestScoresUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.student_test_scores.flat?pagesize=0')
        .constant('colorListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.color_list.flat?pagesize=0')
        .constant('stdAssocCatUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.stdAssocCat.flat?pagesize=0')
        .constant('allStdCatsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.allStdCats.flat?pagesize=0')
        .constant('scoreColorsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.scoreColorList.flat?pagesize=0')
        .constant('gradeScaleListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.gradeScaleList.flat?pagesize=0')
        .constant('schoolListUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.schoolist.flat?pagesize=0')
        .constant('gradescaleitemsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.gradescaleitems.flat?pagesize=0')
        .constant('testScoreRulesUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.test_rules.flat?pagesize=0')
        .constant('uniqueGradesUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.uniqueGrades.flat?pagesize=0')
        .constant('GSIColorMatchUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.findGSIColorMatch.flat?pagesize=0')
        .constant('sortGradeScaleItemsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.sortScaleItems.flat?pagesize=0')
        .constant('testBandsAllUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.testBandsAll.flat?pagesize=0')
        .constant('testWindowsAllUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.testWindowsAll.flat?pagesize=0')
        .constant('performanceBandsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.performanceBands.flat?pagesize=0')
        .constant('performanceGroupUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.performanceGroups.flat?pagesize=0')
        .constant('getMainGradescalesUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.getMainPageGradeScales.flat?pagesize=0')
        .constant('getStuAltSchoolsUrl', '/ws/schema/query/us.ia.k12.urbandale.powerschool.lrngReqPro.getStuAltSchools.flat?pagesize=0')

        .constant('colorsWriteAddr', '/ws/schema/table/U_LRNGREQPRO_COLORS')
        .constant('prefWriteAddr', '/ws/schema/table/U_LRNGREQPRO_PREF')
        .constant('stdCatWriteAddr', '/ws/schema/table/U_LRNGREQPRO_STDCAT')
        .constant('shownTestsWriteAddr', '/ws/schema/table/U_LRP_testscore_ext')
        .constant('categoriesWriteAddr', '/ws/schema/table/U_LRP_STANDARD_CATEGORIES')
        .constant('gradescaleDescAddr', '/ws/schema/table/u_lrp_gs_descriptions')
        .constant('gradescaleAssignAddr', '/ws/schema/table/u_lrp_assign_gradescale')
        .constant('scoreColorsAddr', '/ws/schema/table/u_lrp_color_list')
        .constant('gradescaleSortAddr', '/ws/schema/table/u_lrp_gs_order')
        .constant('testBandsAddr', '/ws/schema/table/u_lrp_testband')
        .constant('performanceBandAddr', '/ws/schema/table/u_lrp_performance_bands')
        .constant('testWindowsAddr', '/ws/schema/table/u_lrp_testwindow')
        .constant('performanceGroupAddr', '/ws/schema/table/u_lrp_performance_group');
});