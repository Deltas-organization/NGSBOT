import { TranslatorBase } from "./bases/translatorBase";
import { INGSSchedule } from "../interfaces/INGSSchedule";
import { NGSScheduleDataStore } from "../NGSScheduleDataStore";
import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { debug } from "console";

export class ScheduleLister extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    constructor(client: Client, private NGSScheduleDataStore: NGSScheduleDataStore) {
        super(client);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        let duration = 0;
        let endDays = duration;
        if (commands.length == 1) {
            let parsedNumber = parseInt(commands[0])
            if (isNaN(parsedNumber)) {
                await messageSender.SendMessage(`the value provided is not a number: ${commands[0]}`)
                return;
            }
            if (parsedNumber > 10) {
                await messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`)
                return;
            }
            duration = parsedNumber;
            endDays = duration;
            if (detailed)
                endDays = -1;
        }

        let filteredGames = await this.getfilteredGames(duration, endDays);
        await this.SendMessages(filteredGames, messageSender);
    }

    private async getfilteredGames(daysInFuture: number, daysInFutureClamp: number) {
        var todaysUTC = new Date().getTime();
        let scheduledGames = await this.NGSScheduleDataStore.GetSchedule();
        let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture + 1, daysInFutureClamp));
        filteredGames = filteredGames.sort((f1, f2) => {
            let result = f1.DaysAhead - f2.DaysAhead
            if (result == 0) {
                let f1Date = new Date(+f1.scheduledTime.startTime);
                let f2Date = new Date(+f2.scheduledTime.startTime);
                let result = f1Date.getHours() - f2Date.getHours();
                if (result > 0)
                    return 1;
                else if (result < 0)
                    return -1;
                else {
                    result = f1Date.getMinutes() - f2Date.getMinutes();
                    if (result > 0)
                        return 1;
                    else if (result < 0)
                        return -1;
                    return 0;
                }
            }

            return result;
        });
        return filteredGames;
    }

    private filterSchedule(todaysUTC: number, schedule: INGSSchedule, daysInFuture: number, daysInFutureClamp: number) {
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = scheduledDate.getTime();

        var ms = scheduledUTC - todaysUTC;
        let dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);

        if (dayDifference >= 0 && dayDifference <= daysInFuture) {
            if (daysInFutureClamp > -1 && dayDifference < daysInFutureClamp) {
                return false;
            }
            schedule.DaysAhead = dayDifference;
            return true;
        }

        return false;
    }

    private async SendMessages(scheduledMatches: INGSSchedule[], messageSender: MessageSender) {
        let message = '';
        let currentDaysAhead = -1;
        let currentTime = -1;
        let dayGroupMessages = [];

        for (var i = 0; i < scheduledMatches.length; i++) {
            let m = scheduledMatches[i];
            let scheduledDateUTC = new Date(+m.scheduledTime.startTime);
            let hours = scheduledDateUTC.getUTCHours();
            if (hours <= 5) {
                hours = 24 - 5 + hours;
            }
            let minutes: any = scheduledDateUTC.getMinutes();
            if (minutes == 0)
                minutes = "00";

            let newMessage = ''

            if (currentDaysAhead != m.DaysAhead) {
                dayGroupMessages.push(message);
                let date = scheduledDateUTC.getUTCDate();
                if (hours >= 19)
                    date -= 1;
                message = "";
                newMessage = `\n**__${scheduledDateUTC.getMonth() + 1}/${date}__** \n`
                currentDaysAhead = m.DaysAhead;
                currentTime = -1;
            }
            if (currentTime != hours + minutes) {
                if (currentTime != -1)
                    newMessage += '\n';

                currentTime = hours + minutes;

                let pmMessage = "am";
                if (hours > 12) {
                    hours -= 12;
                    pmMessage = "pm";
                }

                newMessage += `**${hours - 2}:${minutes}${pmMessage} P | ${hours - 1}:${minutes}${pmMessage} M | `;
                if (hours + 1 == 12) {
                    pmMessage = "am";
                }
                newMessage += `${hours + 1}:${minutes}${pmMessage} E **\n`;
            }
            newMessage += `${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}** \n`;
            if (m.casterUrl && m.casterUrl.toLowerCase().indexOf("twitch") != -1) {
                if (m.casterUrl.indexOf("www") == -1) {
                    m.casterUrl = "https://www." + m.casterUrl;
                }
                else if (m.casterUrl.indexOf("http") == -1) {
                    m.casterUrl = "https://" + m.casterUrl;
                }

                newMessage += `[${m.casterName}](${m.casterUrl}) \n`;
            }

            message += newMessage;
        }

        message = "";
        for (var i = 0; i < dayGroupMessages.length; i++) {
            let groupMessage = dayGroupMessages[i];
            if (groupMessage.length + message.length > 2048) {
                await messageSender.SendMessage(message);
                message = "";
            }

            message += groupMessage;

        }

        await messageSender.SendMessage(message);
    }
}