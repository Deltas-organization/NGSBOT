import { INGSSchedule } from "../interfaces";
import { MessageHelper } from "./MessageHelper";
import moment = require("moment-timezone");
import { DateHelper } from "./DateHelper";
import { TeamSorter } from "./TeamSorter";
import { ScheduleContainer } from "../models/ScehduleContainer";
import { DataStoreWrapper } from "./DataStoreWrapper";
import { NGSDivisions } from "../enums/NGSDivisions";

export class ScheduleHelper {

    public static async GetTodaysGamesSorted(dataStore: DataStoreWrapper) {
        return this.GetFutureGamesSorted(await dataStore.GetSchedule());
    }

    public static async GetTodaysGamesByDivisions(dataStore, ...divisions: NGSDivisions[]) {
        var filteredGames = await ScheduleHelper.GetTodaysGamesSorted(dataStore);
        filteredGames = filteredGames.filter(f => {
            for (var division of divisions) {
                if (f.divisionDisplayName == division)
                    return true
            }
            return false;
        });
        if (filteredGames.length <= 0) {
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    public static GetFutureGamesSorted(scheduledGames: INGSSchedule[], daysInFuture: number = 0) {
        let futureGames: INGSSchedule[] = [];
        const todaysUTC = DateHelper.ConvertDateToUTC(new Date());
        for (var schedule of scheduledGames) {
            let scheduledDate = new Date(+schedule.scheduledTime.startTime);
            let scheduledUTC = DateHelper.ConvertDateToUTC(scheduledDate)
            var ms = scheduledUTC.getTime() - todaysUTC.getTime();
            if (ms > 0) {
                futureGames.push(schedule);
            }
        }

        futureGames = futureGames.sort((s1, s2) => {
            let f1Date = new Date(+s1.scheduledTime.startTime);
            let f2Date = new Date(+s2.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            else
                return TeamSorter.SortByDivision(s1.divisionDisplayName, s2.divisionDisplayName);
        });


        futureGames = futureGames.filter(s => ScheduleHelper.GetGamesBetweenDates(s, daysInFuture));
        return futureGames;
    }

    public static GetMessages(scheduledMatches: INGSSchedule[]): Promise<string[]> {
        return new Promise<string[]>((resolver, rejector) => {
            let messagesToSend: string[] = [];
            let scheduleContainer: ScheduleContainer = null;
            let currentTime = '';
            let schedulesByDay: ScheduleContainer[] = [];
            let currentDay = '';

            for (var i = 0; i < scheduledMatches.length; i++) {
                let m = scheduledMatches[i];
                let momentDate = moment(+m.scheduledTime.startTime);
                let pacificDate = momentDate.clone().tz('America/Los_Angeles');
                let mountainDate = momentDate.clone().tz('America/Denver');
                let centralDate = momentDate.clone().tz('America/Chicago');
                let easternDate = momentDate.clone().tz('America/New_York');

                let formattedDate = centralDate.format('MM/DD');
                let formattedTime = centralDate.format('h:mma');

                if (currentDay != formattedDate) {
                    scheduleContainer = new ScheduleContainer(`**__${formattedDate}__**`);
                    schedulesByDay.push(scheduleContainer);
                    currentDay = formattedDate;
                    currentTime = '';
                }
                if (currentTime != formattedTime) {
                    currentTime = formattedTime;
                    let timeSection = `**__${pacificDate.format('h:mma')} P | ${mountainDate.format('h:mma')} M | ${centralDate.format('h:mma')} C | ${easternDate.format('h:mma')} E __**`;
                    scheduleContainer.AddNewTimeSection(timeSection);
                }

                let scheduleMessage = new MessageHelper<any>('scheduleMessage');
                if (m.divisionDisplayName)
                    scheduleMessage.AddNew(`${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}**`);
                else
                    scheduleMessage.AddNew(`**${m.home.teamName}** vs **${m.away.teamName}**`);

                if (m.casterUrl && m.casterUrl.toLowerCase().indexOf("twitch") != -1) {
                    if (m.casterUrl.indexOf("www") == -1) {
                        m.casterUrl = "https://www." + m.casterUrl;
                    }
                    else if (m.casterUrl.indexOf("http") == -1) {
                        m.casterUrl = "https://" + m.casterUrl;
                    }

                    scheduleMessage.AddNewLine(`[${m.casterName}](${m.casterUrl})`);
                }
                scheduleContainer.AddSchedule(scheduleMessage);
            }

            for (var daySchedule of schedulesByDay) {
                daySchedule.GetAsStringArray().forEach(item => {
                    messagesToSend.push(item);
                })
            }
            resolver(messagesToSend);
        });
    }

    public static GetGamesBetweenDates(schedule: INGSSchedule, daysInFuture: number) {
        let todaysUTC = DateHelper.ConvertDateToUTC(new Date());
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = DateHelper.ConvertDateToUTC(scheduledDate)

        var ms = scheduledUTC.getTime() - todaysUTC.getTime();
        let dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);

        if (dayDifference >= 0 && dayDifference <= daysInFuture) {
            return true;
        }

        return false;
    }
}