require('dotenv').config(); // Recommended way of loading dotenv

import container from "../inversify/inversify.config";
import { TYPES } from "../inversify/types";
import { CronHelper } from "./cron-helper";

const cronHelper = container.get<CronHelper>(TYPES.CronHelper);
export class CronRunner {
    private constructor() {

    }

    public static async Process(processArgs: string[]) {
        if (processArgs.length !== 3)
            return;
        const runner = new CronRunner();
        switch (processArgs[2].toLowerCase()) {
            case "schedule":
                await runner.SendSchedule();
                break;
            case "history":
                await cronHelper.CheckHistory();
                break;
            case "check":
                await cronHelper.CheckReportedGames();
                break;
            case "nextweek":
                await cronHelper.CheckSundaysUnScheduledGames();
                break;
            case "flex":
                await cronHelper.CheckFlexMatches();
                break;
        }

        process.exit();
    }

    private async SendSchedule() {
        await cronHelper.sendSchedule();
        await cronHelper.sendScheduleForMom();
        await cronHelper.sendScheduleForSis();
        await cronHelper.sendRequestedSchedules();
    }
}

CronRunner.Process(process.argv);