
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { WorkerBase } from "./Bases/WorkerBase";

export class ScheduleWorker extends WorkerBase {
    protected async Start(commands: string[]) {
        let duration = 1;
        if (commands.length == 1) {
            let parsedNumber = parseInt(commands[0])
            if (isNaN(parsedNumber)) {
                await this.SearchByDivision(commands);
                return;
            }
            if (parsedNumber > 10) {
                await this.messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`)
                return;
            }
            duration = parsedNumber;
        }
        else if (commands.length == 2) {
            await this.SearchByDivision(commands);
            return;
        }

        let filteredGames = await ScheduleHelper.GetGamesSorted(await this.dataStore.GetScheduledGames(), duration);
        let messages = await ScheduleHelper.GetMessages(filteredGames);
        if (messages.length <= 0) {
            messages.push("Couldn't find any scheduled Games");
        }
        for (const message of messages) {
            await this.messageSender.SendMessage(message);
        }
        await this.messageSender.originalMessage.delete();
    }

    private async SearchByDivision(commands: string[]) {
        var division = commands[0];
        if (commands.length == 2) {
            var coast = commands[1];
            if (coast.toLowerCase() == "ne")
                division += "-northeast";
            else if (coast.toLowerCase() == "se")
                division += "-southeast";
            else
                division += `-${coast}`;
        }

        let scheduledGames = await ScheduleHelper.GetGamesSorted(await this.dataStore.GetScheduledGames());
        scheduledGames = scheduledGames.filter(s => {
            if (!s.divisionConcat.startsWith(division))
                return false;

            return true;
        });
        if (scheduledGames.length > 0) {
            let messages = await ScheduleHelper.GetMessages(scheduledGames);
            await this.messageSender.SendMessages(messages);
        }
        else {
            await this.messageSender.SendBasicMessage("didn't find anything on the schedule");
        }
    }
}
