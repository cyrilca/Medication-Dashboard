'use strict';

var PRIOR_TIME = 5,
    AFTER_TIME = 5;

angular
    .module('medicationReminderApp')
    .controller('MainCtrl', function($scope, $http, $window, api, ngAudio, Modal, ngDialog) {

        // Dates for initial load
        var start = moment().format('MM/DD/YYYY'),
            end = moment().add(1, 'day').format('MM/DD/YYYY');

        // Some sounds
        $scope.sounds = {
            long: ngAudio.load("assets/sound1.mp3"),
            short: ngAudio.load("assets/sound2.wav")
        }

        // Calendar's date
        $scope.date = null;

        // Listen on date
        $scope.$watch('date', function(next, prev, index) {
            if (next) {
                var today = moment(next, 'DD/MM/YYYY').format('MM/DD/YYYY');
                var tomorrow = moment(next, 'DD/MM/YYYY').add(1, 'day').format('MM/DD/YYYY');
                $scope.getMedications(today, tomorrow);
            }
        });

        // Returns whether list has missed items or not
        $scope.noMissed = function() {
            if ($scope.meds) {
                return $scope.meds.every(function(element) {
                    return !element.isMissed;
                });
            }
        };

        // Holds modal id
        $scope.openModalId = null;

        // Retrives data from API
        $scope.getMedications = function(start, end, callback) {
            if (typeof callback !== 'function') callback = function() {};
            api.getMedications(start, end).then(function(res) {
                $scope.meds = res.data;
                $scope.meds = $scope.setPriorAfterTime();
                callback(res);
            });
        }

        // Sets medications on initial load
        $scope.getMedications(start, end, function(res) {
            // Uncomment to create a fake item

            // var fakePrior = moment().add(5, 'seconds').format();
            // var fakeTime = moment().add(15, 'seconds').format()
            // var fakeAfter = moment().add(20, 'seconds').format()
            //
            // var fakeItem = {
            //     "_id": "57b24e85086d0e6bb1e2d73d",
            //     completed: false,
            //     dosage: '110ml',
            //     isMissed: false,
            //     name: 'Medication 11',
            //     priorTime: fakePrior,
            //     afterTime: fakeAfter,
            //     time: fakeTime
            // };
            //
            // $scope.meds = null;
            // $scope.meds = [fakeItem];
        });

        // Create modal window
        $scope.createModal = function(_data) {

            return ngDialog.open({
                template: 'app/templates/popup.html',
                className: 'ngdialog-theme-default',
                controller: ['$scope', 'completeMedication', function($scope, completeMedication) {

                    // Data to have within the tempate
                    $scope.name = $scope.ngDialogData.name;
                    $scope.dosage = $scope.ngDialogData.dosage;
                    $scope._id = $scope.ngDialogData._id;
                    $scope.completeClicked = false;

                    // Complete medication action in modal window
                    $scope.completeMedication = function(_id) {

                        $scope.$parent.completeById(_id).then(function(res) {
                            // Displays succesful info
                            $scope.completeClicked = true;

                            // 4 sec timeout for the message
                            setTimeout(function() {
                                ngDialog.close($scope.openModalId.id)
                            }, 4000);

                        });
                    }

                    // Closes modal
                    $scope.closeWindow = function() {
                        ngDialog.close($scope.openModalId.id);
                    }

                }],
                resolve: {
                    // Injects completeMedication method from api
                    completeMedication: ['api', function(api) {
                        return api.completeMedication;
                    }]
                },
                scope: $scope,
                data: _data
            });
        }

        $scope.checkListOnMissed = function() {
            var currentTime = moment($scope.currentTime, 'h:mm:ss a');

            $scope.meds.forEach(function(el) {

                // Converts time to MomentJS objects
                var priorTime = moment(el.priorTime),
                    takeTime = moment(el.time),
                    afterTime = moment(el.afterTime);

                // Calls when the time is prior taking a pill
                if (currentTime.isAfter(priorTime) && currentTime.isBefore(takeTime)) {
                    el.showButton = true;
                }

                // Calls when it's time to take
                if (currentTime.isSame(takeTime)) {
                    $scope.sounds.short.play();
                    $scope.openModalId = $scope.createModal(el);
                }

                // Calls when the time is out
                if (currentTime.isAfter(afterTime)) {
                    if (!el.isMissed && !el.completed) {
                        $scope.sounds.long.play();
                        ngDialog.close($scope.openModalId.id);
                        el.isMissed = true;
                    }
                }

            });

        }

        // Completes by id
        $scope.completeById = function(id) {

            return new Promise(function(resolve, reject) {

                $scope.meds.forEach(function(el) {
                    if (el._id === id) {
                        el.completed = true;
                        el.isMissed = false;
                        // Updates object in DB
                        api.completeMedication(id).then(function(res) {
                            resolve(res);
                        });
                    }

                });

            });

        };

        // Returns modified Array of objects including time prior/after time
        $scope.setPriorAfterTime = function() {
            return $scope.meds.map(function(el) {

                var now = Date.now();
                var medDate = Date.parse(el.time);
                var priorTime = moment(el.time).subtract(PRIOR_TIME, 'minute');
                var afterTime = moment(el.time).add(AFTER_TIME, 'minute');

                return Object.assign({}, el, {
                    isMissed: now > medDate && !el.completed ? true : false,
                    priorTime: priorTime.format(),
                    afterTime: afterTime.format(),
                    showButton: now > Date.parse(priorTime) && !el.completed? true : false
                });

            });
        };

        $window.setInterval(function() {
            $scope.currentDate = moment().format('MMMM Do, YYYY');
            $scope.currentTime = moment().format('h:mm:ss a');
            $scope.checkListOnMissed();
            $scope.$apply();
        }, 1000);

    });
