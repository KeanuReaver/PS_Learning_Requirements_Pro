'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');
    const $j = require('jquery');

    module.controller('LearningRequirementsMainController', ['$scope', '$window', '$document', 'mainViewLogic', 'transHashFactory', function($scope, $window, $document, mainViewLogic, transHashFactory) {
        $scope.portalAddress;       // init value
        $scope.curyearid;           // init value
        $scope.curstudid;           // init value
        $scope.studschoolid;        // init value
        $scope.gradeLevel;          // init value
        $scope.tranTags;            // init value
        $scope.langCode;            // init value
        $scope.pictureWizardSteps;

        $scope.studentTestScores = [];
        $scope.classList = [];
        $scope.gradeScales = [];
        $scope.contentMaxHeight = '0px';
        $scope.windowWidth = $window.innerWidth;
        $scope.isMobile = ($scope.windowWidth <= 880);
        $scope.showUngraded = false;
        $scope.showColorsMaster;
        
        function getClassData() {
            console.log($scope.studschoolid);
            mainViewLogic.getLearningRequirementsTlists($scope.portalAddress, $scope.curstudid, $scope.curyearid, $scope.studschoolid)
                .then(response => {
                    $scope.classList = response.classList;
                    $scope.studentTestScores = response.studentTest;
                    $scope.gradeScales = transHashFactory.translateGradeScales(response.gradeScales, $scope.langCode);
                })
                .catch(error => console.error('Failed to get class/test data:', error));
        }
        
        function checkIfMobile() {
            $scope.isMobile = ($scope.windowWidth <= 880);
        }
        
        $scope.darkMode = mainViewLogic.getDarkMode();
        
        
        $scope.toggleShowColors = function ($event) {
            if ($event && $event.type === 'keypress' && ($event.key === 'Enter' || $event.key === ' ')) {
                $scope.showColorsMaster = !$scope.showColorsMaster;
                localStorage.setItem('ucsd_showColorsMaster', JSON.stringify($scope.showColorsMaster));
                $event.preventDefault();
            }
        };
        
        $scope.$watch('showColorsMaster', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                localStorage.setItem('ucsd_showColorsMaster', JSON.stringify(newVal));
            }
        });
        
        angular.element($window).on('resize', function() {
            $scope.$apply(() => {
                $scope.windowWidth = $window.innerWidth;
                checkIfMobile();
            });
        });
    
        // Call getClassData on page load
        $j(() => {    
            getClassData();
            mainViewLogic.organizeInsertedContent();
            $scope.pictureWizardSteps = mainViewLogic.getWizardArray($document[0].getElementById('wizard-data').dataset)
            
            try {
                const stored = localStorage.getItem('ucsd_showColorsMaster');
                $scope.showColorsMaster = stored !== null ? JSON.parse(stored) : true;
            } catch (e) {
                $scope.showColorsMaster = true;
            }
        });
    
        // Cleanup the event listener when the controller is destroyed
        $scope.$on('$destroy', function() {
            angular.element($window).off('resize');
        });

    }]);
});