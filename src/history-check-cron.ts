require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import {TYPES} from "./inversify/types";
import { CronHelper } from "./crons/cron-helper";
const cronHelper = container.get<CronHelper>(TYPES.CronHelper);
cronHelper.CheckHistory().then(() =>
{
    process.exit();
});