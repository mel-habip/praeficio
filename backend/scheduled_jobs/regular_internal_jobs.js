import cron from "node-cron";
import emailService from '../jobs/emailService.js';

import query from '../utils/db_connection.js';
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
        let monthly_tasks = await query(`Select * FROM Alerts WHERE Frequency = 'MONTHLY' AND Active = TRUE`);
        for await (const task of monthly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    daily: cron.schedule("1 1 * * *", async function () { //at 1:01 am
        log(`Daily triggerred`);

        let daily_tasks = await query(`Select * FROM Alerts WHERE Frequency = 'DAILY' AND Active = TRUE`);
        for await (const task of daily_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    quarterly: cron.schedule("1 2 1 1,4,7,10 *", async function () { //at 2:01am
        log(`Quarterly triggerred`);
        let quarterly_tasks = await query(`Select * FROM Alerts WHERE Frequency = 'QUARTERLY' AND Active = TRUE`);
        for await (const task of quarterly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    })
};

export default REGULAR_SCHEDULED_JOBS;

const KNOWN_TASKS = {
    future_dividends: async function (time_period) {},
    past_dividends: async function (time_period) {},
    past_performance : async function (time_period) {},
    analyst_recommendations: async function () {}
};

async function job_handler(job, details) {
    //knows how to handle a job.
    if (!KNOWN_TASKS[job]) {
        emailService({}) //to the owner, if email is known. do LEFT JOIN in query to know the emails.
    }
};