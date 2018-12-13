const cron = require('node-cron');
const Meeting = require('../models/MeetingModel');
const _ = require('lodash');
const User = require('../models/UserModel');

// Check all meetings startAt time for every minute and will change it's status 
// from upcoming to ongoing if at that minute it indicates the time for that meeting to
// change it's status to ongoing, which is default 2 hours before startAt taking place
// '* * * * *'

module.exports = {

    onGoing() {
        cron.schedule('* * * * *', () => {
            let now = new Date();
            let nowDetail = {
                year: now.getFullYear(),
                month: now.getMonth(),
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes()
            };

            let toBeOngoing = [];
            let toBeNotified = [];
            Meeting.find()
                .then((meetings) => {
                    for (let i = 0; i < meetings.length; i++) {
                        let onGoingHours = meetings[i].startAt.getHours() - 2; // 2 hours before the meeting time
                        let onGoingAt = meetings[i].startAt;
                        onGoingAt.setHours(onGoingHours);

                        let onGoingDetail = {
                            year: onGoingAt.getFullYear(),
                            month: onGoingAt.getMonth(),
                            day: onGoingAt.getDate(),
                            hour: onGoingAt.getHours(),
                            minute: onGoingAt.getMinutes()
                        };

                        if (_.isEqual(nowDetail, onGoingDetail)) {
                            toBeOngoing.push(meetings[i]._id);
                            toBeNotified.push(...meetings[i].participants);
                        }
                    }

                    console.log('toBeOngoing:', toBeOngoing);
                    console.log('toBeNotified:', toBeNotified);

                    Meeting.updateMany(
                        { _id: { $in: toBeOngoing } },
                        { $set: { "status": "ongoing" } }
                    )
                        .then((result) => {
                            console.log('Cron Update Many Result:', result);
                            User.updateMany(
                                { _id: { $in: toBeNotified } },
                                { $push: { notifications: 'Now is the time to move, mate!' } }
                            )
                                .then((pushNotifResult) => {
                                    console.log('Notif Result', pushNotifResult);
                                })
                                .catch((err) => {
                                    console.log('Push Notif Error: ', err);
                                });
                        })
                        .catch((err) => {
                            console.log('Cron Update Many Error:', err);
                        });
                })
                .catch((err) => {
                    console.log('Find All Meetings In Cron Error:', err);
                });
        });
    },

    myCron() {

        new CronJob('0 7 1 * *', function() {
            // do something
        }, null, true, 'Asia/Jakarta');

    }

}
