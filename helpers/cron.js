const CronJob = require('cron').CronJob;

module.exports = {

    myCron() {

        new CronJob('0 7 1 * *', function() {
            // do something
        }, null, true, 'Asia/Jakarta');

    }

}
