import { NGSDivisions } from "../enums/NGSDivisions";
import { INGSSchedule } from "../interfaces";
import { ScheduleContainer } from "../models/ScehduleContainer";
import { DataStoreWrapper } from "./DataStoreWrapper";
import { DateHelper } from "./DateHelper";
import { MessageHelper } from "./MessageHelper";
import { TeamSorter } from "./TeamSorter";
import moment = require("moment-timezone");

export class ScheduleHelper {

    public static async GetTodaysGamesSorted(dataStore: DataStoreWrapper): Promise<INGSSchedule[]> {
        return this.GetGamesSorted(await dataStore.GetScheduledGames());
    }

    public static async GetTodaysGamesByDivisions(dataStore, ...divisions: NGSDivisions[]) {
        var filteredGames = (await ScheduleHelper.GetTodaysGamesSorted(dataStore));
        filteredGames = filteredGames.filter(f => {
            for (var division of divisions) {
                if (f.divisionDisplayName.toLowerCase().replace(/\s/g, '') == division.toLowerCase().replace(/\s/g, ''))
                    return true
            }
            return false;
        });
        if (filteredGames.length <= 0) {
            return;
        }
        return await ScheduleHelper.GetMessages(filteredGames);
    }

    public static GetGamesByDaysSorted(scheduledGames: INGSSchedule[], dayBuffer: number): ScheduleInformation[] {
        let games: ScheduleInformation[] = [];
        const todaysUTC = DateHelper.ConvertDateToUTC(new Date());
        var positive = dayBuffer > 0;
        var absoluteValue = dayBuffer;
        if (!positive)
            absoluteValue = dayBuffer * -1;

        for (var schedule of scheduledGames) {
            let scheduledDate = new Date(+schedule.scheduledTime.startTime);
            let scheduledUTC = DateHelper.ConvertDateToUTC(scheduledDate);
            var dayDifference = this.GetDayDifference(scheduledUTC, todaysUTC);
            var dayCount = dayDifference.dayCount;
            if (dayCount < absoluteValue) {
                if (positive) {
                    if (dayDifference.future) {
                        games.push({ days: dayCount, schedule });
                    }
                }
                else {
                    if (!dayDifference.future) {
                        games.push({ days: dayCount, schedule });
                    }
                }
            }
        }

        return ScheduleHelper.SortGames(games);
    }

    private static GetDayDifference(firstDate: Date, secondDate: Date) {
        var ms = firstDate.getTime() - secondDate.getTime();
        var inFuture = true;
        if (ms < 0) {
            inFuture = false;
            ms *= -1;
        }
        var result = Math.floor(ms / 1000 / 60 / 60 / 24);

        return { dayCount: result, future: inFuture };
    }

    public static GetGamesSorted(scheduledGames: INGSSchedule[], daysInFuture: number = 1): INGSSchedule[] {
        return ScheduleHelper.GetGamesByDaysSorted(scheduledGames, daysInFuture).map(g => g.schedule);
    }

    private static SortGames(games: ScheduleInformation[]): ScheduleInformation[] {
        return games.sort((s1, s2) => {
            let s1Schedule = s1.schedule;
            let s2Schedule = s2.schedule;
            let f1Date = new Date(+s1Schedule.scheduledTime.startTime);
            let f2Date = new Date(+s2Schedule.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            else
                return TeamSorter.SortByDivision(s1Schedule.divisionDisplayName, s2Schedule.divisionDisplayName);
        });
    }

    public static GetMessages(scheduledMatches: INGSSchedule[]): Promise<string[]> {
        return new Promise<string[]>((resolver, rejector) => {
            let messagesToSend: string[] = [];
            let scheduleContainer: ScheduleContainer | null = null;
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
                    if (scheduleContainer)
                        scheduleContainer.AddNewTimeSection(timeSection);
                }

                let scheduleMessage = new MessageHelper<any>('scheduleMessage');
                if (m.divisionDisplayName)
                {
                    scheduleMessage.AddNew(`${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}**`);
                }
                else if(m.title)
                {
                    scheduleMessage.AddNewLine(`**${m.title}**`);
                    scheduleMessage.AddNewLine(`**${m.home.teamName}** vs **${m.away.teamName}**`);
                }
                else
                {
                    scheduleMessage.AddNew(`**${m.home.teamName}** vs **${m.away.teamName}**`);
                }

                const twitchIndex = m.casterUrl?.toLowerCase().indexOf("twitch");
                if (twitchIndex && twitchIndex != -1) {
                    var twitchURL = m.casterUrl.slice(twitchIndex);
                    m.casterUrl = "https://www." + twitchURL;

                    scheduleMessage.AddNewLine(`[${m.casterName}](${m.casterUrl})`);
                }
                if (scheduleContainer)
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
}

export class ScheduleInformation {
    constructor(public days: number, public schedule: INGSSchedule) { }
}