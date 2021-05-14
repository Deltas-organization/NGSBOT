
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { WorkerBase } from "./Bases/WorkerBase";

export class ScheduleWorker extends WorkerBase {
    protected async Start(commands: string[]) {        
        let duration = 0;
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
            duration = parsedNumber -1;
        }
        else if (commands.length == 2) {
            await this.SearchByDivision(commands);
            return;
        }

        let filteredGames = await ScheduleHelper.GetFutureGamesSorted(await this.dataStore.GetSchedule(), duration);
        let messages = await ScheduleHelper.GetMessages(filteredGames);
        for (var index = 0; index < messages.length; index++) {
            await this.messageSender.SendMessage(messages[index]);
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

        let scheduledGames = await await ScheduleHelper.GetFutureGamesSorted(await this.dataStore.GetSchedule());
        scheduledGames = scheduledGames.filter(s => {
            if (!s.divisionConcat.startsWith(division))
                return false;

            return true;
        });
        let messages = await ScheduleHelper.GetMessages(scheduledGames);
        await this.messageSender.SendMessages(messages);
    }
}
