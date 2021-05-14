import { MessageSender } from "../helpers/MessageSender";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { NGSDivisions } from "../enums/NGSDivisions";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { ScheduleWorker } from "../workers/ScheduleWorker";

export class ScheduleLister extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    public async getGameMessagesForToday() {
        var filteredGames = await ScheduleHelper.GetFutureGamesSorted(await this.dataStore.GetSchedule());
        if (filteredGames.length <= 0) {
            Globals.log("No games available for today.");
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    public async getGameMessagesForTodayByDivision(ngsDivision: NGSDivisions) {
        var filteredGames = await ScheduleHelper.GetFutureGamesSorted(await this.dataStore.GetSchedule());
        filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
        if (filteredGames.length <= 0) {
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new ScheduleWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}