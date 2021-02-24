import { INGSSchedule } from "../interfaces/INGSSchedule";
import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { LiveDataStore } from "../LiveDataStore";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { Globals } from "../Globals";
import { TeamSorter } from "../helpers/TeamSorter";
import { NGSDivisions } from "../enums/NGSDivisions";
import { MessageHelper } from "../helpers/MessageHelper";

export class ScheduleLister extends AdminTranslatorBase
{

    public get commandBangs(): string[]
    {
        return ["Schedule", "sch"];
    }

    public get description(): string
    {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    public async getGameMessagesForToday()
    {
        var filteredGames = await this.GetGames(0, 0);
        if (filteredGames.length <= 0)
        {
            Globals.log("No games available for today.");
            return;
        }
        return await this.getMessages(filteredGames);
    }

    public async getGameMessagesForTodayByDivision(ngsDivision: NGSDivisions)
    {
        var filteredGames = await this.GetGames(0, 0);
        filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
        if (filteredGames.length <= 0)
        {
            return;
        }
        return await this.getMessages(filteredGames);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        let duration = 0;
        let endDays = duration;
        if (commands.length == 1)
        {
            let parsedNumber = parseInt(commands[0])
            if (isNaN(parsedNumber))
            {
                await this.SearchByDivision(commands, messageSender);
                return;
            }
            if (parsedNumber > 10)
            {
                await messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`)
                return;
            }
            duration = parsedNumber;
            endDays = duration;
            if (detailed)
                endDays = -1;
        }
        else if (commands.length == 2)
        {
            await this.SearchByDivision(commands, messageSender);
            return;
        }


        let filteredGames = await this.GetGames(duration, endDays);
        let messages = await this.getMessages(filteredGames);
        for (var index = 0; index < messages.length; index++)
        {
            await messageSender.SendMessage(messages[index]);
        }
        await messageSender.originalMessage.delete();
    }

    private async GetGames(daysInFuture: number, daysInFutureClamp: number)
    {
        let filteredGames = await this.getfilteredGames(daysInFuture, daysInFutureClamp)
        return await this.sortSchedule(filteredGames);
    }

    private async getfilteredGames(daysInFuture: number, daysInFutureClamp: number)
    {
        var todaysUTC = this.ConvertDateToUTC(new Date());
        let scheduledGames = await this.liveDataStore.GetSchedule();
        let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture, daysInFutureClamp));
        filteredGames = filteredGames.sort((f1, f2) =>
        {
            let f1Date = new Date(+f1.scheduledTime.startTime);
            let f2Date = new Date(+f2.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            else
                return TeamSorter.SortByDivision(f1.divisionDisplayName, f2.divisionDisplayName);
        });
        return filteredGames;
    }

    private filterSchedule(todaysUTC: Date, schedule: INGSSchedule, daysInFuture: number, daysInFutureClamp: number)
    {
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = this.ConvertDateToUTC(scheduledDate)

        var ms = scheduledUTC.getTime() - todaysUTC.getTime();
        let dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);

        if (dayDifference >= 0 && dayDifference <= daysInFuture)
        {
            if (daysInFutureClamp > -1 && dayDifference < daysInFutureClamp)
            {
                return false;
            }

            schedule.DaysAhead = dayDifference;
            return true;
        }

        return false;
    }

    private ConvertDateToUTC(date: Date): Date
    {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    private sortSchedule(filteredGames: INGSSchedule[]): INGSSchedule[]
    {
        return filteredGames.sort((f1, f2) =>
        {
            let f1Date = new Date(+f1.scheduledTime.startTime);
            let f2Date = new Date(+f2.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            else
                return TeamSorter.SortByDivision(f1.divisionDisplayName, f2.divisionDisplayName);
        });
    }

    private async SearchByDivision(commands: string[], messageSender: MessageSender)
    {
        var division = commands[0];
        if (commands.length == 2)
        {
            var coast = commands[1];
            if (coast.toLowerCase() == "ne")
                division += "-northeast";
            else if (coast.toLowerCase() == "se")
                division += "-southeast";
            else
                division += `-${coast}`;
        }

        var todaysUTC = new Date().getTime();
        let scheduledGames = await this.liveDataStore.GetSchedule();
        let filteredGames = scheduledGames.filter(s =>
        {
            let scheduledDate = new Date(+s.scheduledTime.startTime);
            let scheduledUTC = scheduledDate.getTime();

            if (scheduledUTC < todaysUTC)
                return false;

            if (!s.divisionConcat.startsWith(division))
                return false;

            const ms = scheduledUTC - todaysUTC;
            const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);

            s.DaysAhead = dayDifference;

            return true;
        });
        filteredGames = this.sortSchedule(filteredGames);
        let messages = await this.getMessages(filteredGames);
        for (var index = 0; index < messages.length; index++)
        {
            await messageSender.SendMessage(messages[index]);
        }
    }

    private getMessages(scheduledMatches: INGSSchedule[]): Promise<string[]>
    {
        return new Promise<string[]>((resolver, rejector) =>
        {
            let messagesToSend: string[] = [];
            let message = '';
            let currentTime = -1;
            let dayGroupMessages = [];
            let currentDay = -1;

            for (var i = 0; i < scheduledMatches.length; i++)
            {
                let m = scheduledMatches[i];
                let scheduledDateUTC = this.ConvertDateToUTC(new Date(+m.scheduledTime.startTime));
                let hours = scheduledDateUTC.getHours();
                if (hours <= 6)
                    hours = 24 - 6 + hours;
                else
                    hours -= 6;

                let minutes: any = scheduledDateUTC.getMinutes();
                if (minutes == 0)
                    minutes = "00";

                let newMessage = new MessageHelper<any>('scheduleMessage');

                if (currentDay != scheduledDateUTC.getDay())
                {
                    dayGroupMessages.push(message);
                    let date = scheduledDateUTC.getDate();
                    if (hours >= 19)
                        date -= 1;
                    message = "";
                    newMessage.AddNewLine('');
                    newMessage.AddNewLine(`**__${scheduledDateUTC.getMonth() + 1}/${date}__**`);
                    currentDay = scheduledDateUTC.getUTCDay();
                    currentTime = -1;
                }
                if (currentTime != hours + minutes)
                {
                    // if (currentTime != -1)
                    //     newMessage += '\n';

                    currentTime = hours + minutes;

                    let pmMessage = "am";
                    if (hours > 12)
                    {
                        hours -= 12;
                        pmMessage = "pm";
                    }
                    let pacificMessage = this.GetPacificMessage(hours, minutes, pmMessage);
                    let mountainMessage = this.GetMountainMessage(hours, minutes, pmMessage);

                    newMessage.AddNewLine('');
                    newMessage.AddNewLine(`**${pacificMessage} P | ${mountainMessage} M | ${hours}:${minutes}${pmMessage} C | `);
                    if (hours + 1 == 12)
                    {
                        pmMessage = "am";
                    }
                    newMessage.AddNew(`${hours + 1}:${minutes}${pmMessage} E **`);
                }
                newMessage.AddNewLine(`${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}**`);
                if (m.casterUrl && m.casterUrl.toLowerCase().indexOf("twitch") != -1)
                {
                    if (m.casterUrl.indexOf("www") == -1)
                    {
                        m.casterUrl = "https://www." + m.casterUrl;
                    }
                    else if (m.casterUrl.indexOf("http") == -1)
                    {
                        m.casterUrl = "https://" + m.casterUrl;
                    }

                    newMessage.AddNewLine(`[${m.casterName}](${m.casterUrl}) `);
                }
                newMessage.AddNewLine('');
                message += newMessage.CreateStringMessage();
            }
            dayGroupMessages.push(message);

            message = "";
            for (var i = 0; i < dayGroupMessages.length; i++)
            {
                let groupMessage = dayGroupMessages[i];
                if (groupMessage.length > 0)
                {
                    message += groupMessage;
                }
            }

            messagesToSend.push(message);
            resolver(messagesToSend);
        });
    }
    private GetPacificMessage(hours: number, minutes: any, endMessage: string)
    {
        if (hours == 2)
            return `${12}:${minutes}${endMessage}`;
        else if (hours == 1)
            return `${11}:${minutes}am`;
        else
            return `${hours - 2}:${minutes}${endMessage}`;
    }

    private GetMountainMessage(hours: number, minutes: any, endMessage: string)
    {
        if (hours == 1)
            return `${12}:${minutes}${endMessage}`;
        else
            return `${hours - 1}:${minutes}${endMessage}`;
    }
}

export class ScheduleMessage
{
    public timeSchedules: string[];
    
    constructor(public dateTitle: string)
    {

    }
}