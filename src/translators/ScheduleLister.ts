import { INGSSchedule } from "../interfaces/INGSSchedule";
import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { LiveDataStore } from "../LiveDataStore";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { MessageStore } from "../MessageStore";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { Globals } from "../Globals";
import { TeamSorter } from "../helpers/TeamSorter";
import { NGSDivisions } from "../enums/NGSDivisions";
import { MessageHelper } from "../helpers/MessageHelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { DateHelper } from "../helpers/DateHelper";

export class ScheduleLister extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    public async getGameMessagesForToday() {
        var filteredGames = await this.GetGames();
        if (filteredGames.length <= 0) {
            Globals.log("No games available for today.");
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    public async getGameMessagesForTodayByDivision(ngsDivision: NGSDivisions) {
        var filteredGames = await this.GetGames();
        filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
        if (filteredGames.length <= 0) {
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        let duration = 0;
        if (commands.length == 1) {
            let parsedNumber = parseInt(commands[0])
            if (isNaN(parsedNumber)) {
                await this.SearchByDivision(commands, messageSender);
                return;
            }
            if (parsedNumber > 10) {
                await messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`)
                return;
            }
            duration = parsedNumber -1;
        }
        else if (commands.length == 2) {
            await this.SearchByDivision(commands, messageSender);
            return;
        }

        let filteredGames = await this.GetGames(duration);
        let messages = await ScheduleHelper.GetMessages(filteredGames);
        for (var index = 0; index < messages.length; index++) {
            await messageSender.SendMessage(messages[index]);
        }
        await messageSender.originalMessage.delete();
    }

    private async GetGames(daysInFuture: number = 0) {
        let games = await ScheduleHelper.GetFutureGamesSorted(await this.liveDataStore.GetSchedule());
        games = games.filter(s => ScheduleHelper.GetGamesBetweenDates(s, daysInFuture));
        return games;
    }


    private async SearchByDivision(commands: string[], messageSender: MessageSender) {
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

        let scheduledGames = await this.GetGames();
        scheduledGames = scheduledGames.filter(s => {
            if (!s.divisionConcat.startsWith(division))
                return false;

            return true;
        });
        let messages = await ScheduleHelper.GetMessages(scheduledGames);
        await messageSender.SendMessages(messages);
    }
}

export class ScheduleContainer {
    private _currentSection: string;
    private _timeAndSchedules = new Map<string, MessageHelper<any>[]>()

    constructor(public dateTitle: string) {

    }

    public AddNewTimeSection(sectionTitle: string) {
        this._currentSection = sectionTitle;
        this._timeAndSchedules.set(sectionTitle, []);
    }

    public AddSchedule(scheduleMessage: MessageHelper<any>) {
        this._timeAndSchedules.get(this._currentSection).push(scheduleMessage);
    }

    public GetAsStringArray(): string[] {
        let result = [];
        let dateTitleString = `${this.dateTitle} \n \n`;
        let message = dateTitleString;
        for (var key of this._timeAndSchedules.keys()) {
            let timeMessage = '';
            timeMessage += key;
            timeMessage += "\n";
            for (var schedule of this._timeAndSchedules.get(key)) {

                timeMessage += schedule.CreateStringMessage();
                timeMessage += "\n";
            }
            timeMessage += "\n";
            if (timeMessage.length + message.length > 2048) {
                result.push(message);
                message = dateTitleString
            }
            message += timeMessage;
        }
        result.push(message);
        return result;
    }
}