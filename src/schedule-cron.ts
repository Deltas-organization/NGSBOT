require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";
import { Globals } from "./Globals";
import { CronHelper } from "./crons/cron-helper";
let cronHelper = container.get<CronHelper>(TYPES.CronHelper);
async function sendSchedule() {
    try {
        await cronHelper.sendSchedule();
        await cronHelper.sendRequestedSchedules();
    }
    catch (e) {
        Globals.log(e);
    }
    process.exit();
};
sendSchedule();