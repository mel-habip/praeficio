import cron  from "node-cron";
import emailService from '../jobs/emailService.js';

const log = console.log;

//Note: see @https://crontab-generator.org/ to see how the numbers work


/**
 * Likely plan:
 * 1) Create tables called DailyScheduled, MonthlyScheduled, QuarterlyScheduled, AnnualScheduled, SemiAnnualScheduled
 *   1.1) Or create one table called "ScheduledEvents" and query it separately? This would make it easier to edit Alerts/Scheduled Jobs?
 * 2) When users opt into such Alerts, add to DB an Alert Instance with all the details.
 * 3) User can edit Alert instance,
 * 4) Users can delete Alert instance permanently
 * 5) Users can soft-delete (turn off) Alert instance temporarily
 * 6) FUTURE --> Users can set a temporary 
 * 7) When Cron Job is triggerred, query DB for all jobs that are both on that schedule && are active. Then, for each, do the action.
 */

const REGULAR_SCHEDULED_JOBS = {
    monthly: cron.schedule("1 0 1 * *", async function () { //at 0:01am
        log(`Monthly triggerred`);
        //no tasks yet
    }),
    daily: cron.schedule("1 1 * * *", async function () { //at 1:01 am
        log(`Daily triggerred`);
        //no tasks yet
    }),
    quarterly: cron.schedule("1 2 1 1,4,7,10 *", async function () { //at 2:01am
        log(`Quarterly triggerred`);
        //no tasks yet
    })
};

export default REGULAR_SCHEDULED_JOBS;


