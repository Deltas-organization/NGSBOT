import { INGSSchedule } from "../interfaces/INGSSchedule";
import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { LiveDataStore } from "../LiveDataStore";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { Globals } from "../Globals";

export class ScheduleLister extends AdminTranslatorBase {

    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    public async getGameMessagesForToday() {
        var filteredGames = await this.getfilteredGames(0, 0);
        if(filteredGames.length <= 0)
        {
            Globals.log("No games available for today.");
            return;
        }
        return await this.getMessages(filteredGames);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        let duration = 0;
        let endDays = duration;
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
            duration = parsedNumber;
            endDays = duration;
            if (detailed)
                endDays = -1;
        }
        else if (commands.length == 2) {
            await this.SearchByDivision(commands, messageSender);
            return;
        }


        let filteredGames = await this.getfilteredGames(duration, endDays);
        let messages = await this.getMessages(filteredGames);
        for (var index = 0; index < messages.length; index++) {
            await messageSender.SendMessage(messages[index]);
        }
        await messageSender.originalMessage.delete();
    }

    private async getfilteredGames(daysInFuture: number, daysInFutureClamp: number) {
        var todaysUTC = new Date().getTime();
        let scheduledGames = await this.liveDataStore.GetSchedule();
        let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture, daysInFutureClamp));
        filteredGames = filteredGames.sort((f1, f2) => {
            let result = f1.DaysAhead - f2.DaysAhead
            if (result == 0) {
                let f1Date = new Date(+f1.scheduledTime.startTime);
                let f2Date = new Date(+f2.scheduledTime.startTime);
                let timeDiff = f1Date.getTime() - f2Date.getTime();
                if (timeDiff > 0)
                    return 1;
                else if (timeDiff < 0)
                    return -1;
                else 
                    return 0;
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

    private sortSchedule(filteredGames: INGSSchedule[]): INGSSchedule[] {
        return filteredGames.sort((f1, f2) => {
            let result = f1.DaysAhead - f2.DaysAhead
            if (result == 0) {
                let f1Date = new Date(+f1.scheduledTime.startTime);
                let f2Date = new Date(+f2.scheduledTime.startTime);
                let timeDiff = f1Date.getTime() - f2Date.getTime();
                if (timeDiff > 0)
                    return 1;
                else if (timeDiff < 0)
                    return -1;
                else
                    return 0;
            }

            return result;
        });
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

        var todaysUTC = new Date().getTime();
        let scheduledGames = await this.liveDataStore.GetSchedule();
        let filteredGames = scheduledGames.filter(s => {
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
        for (var index = 0; index < messages.length; index++) {
            await messageSender.SendMessage(messages[index]);
        }
    }

    private getMessages(scheduledMatches: INGSSchedule[]): Promise<string[]> {
        return new Promise<string[]>((resolver, rejector) => {
            let messagesToSend: string[] = [];
            let message = '';
            let currentDaysAhead = -1;
            let currentTime = -1;
            let dayGroupMessages = [];

            for (var i = 0; i < scheduledMatches.length; i++) {
                let m = scheduledMatches[i];
                let scheduledDateUTC = new Date(+m.scheduledTime.startTime);
                let hours = scheduledDateUTC.getUTCHours();
                if (hours <= 6)
                    hours = 24 - 6 + hours;
                else
                    hours -= 6;

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

                    newMessage += `**${hours - 2}:${minutes}${pmMessage} P | ${hours - 1}:${minutes}${pmMessage} M | ${hours}:${minutes}${pmMessage} C | `;
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
            dayGroupMessages.push(message);
            
            message = "";
            for (var i = 0; i < dayGroupMessages.length; i++) {
                let groupMessage = dayGroupMessages[i];
                if (groupMessage.length + message.length > 2048) {
                    messagesToSend.push(message);
                    message = "";
                }

                message += groupMessage;

            }

            messagesToSend.push(message);
            resolver(messagesToSend);
        });
    }
}