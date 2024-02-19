"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleInformation = exports.ScheduleHelper = void 0;
const ScehduleContainer_1 = require("../models/ScehduleContainer");
const DateHelper_1 = require("./DateHelper");
const MessageHelper_1 = require("./MessageHelper");
const TeamSorter_1 = require("./TeamSorter");
const moment = require("moment-timezone");
class ScheduleHelper {
    static GetTodaysGamesSorted(dataStore) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.GetGamesSorted(yield dataStore.GetScheduledGames());
        });
    }
    static GetTodaysGamesByDivisions(dataStore, ...divisions) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = (yield ScheduleHelper.GetTodaysGamesSorted(dataStore));
            filteredGames = filteredGames.filter(f => {
                for (var division of divisions) {
                    if (f.divisionDisplayName.toLowerCase().replace(/\s/g, '') == division.toLowerCase().replace(/\s/g, ''))
                        return true;
                }
                return false;
            });
            if (filteredGames.length <= 0) {
                return;
            }
            return yield ScheduleHelper.GetMessages(filteredGames);
        });
    }
    static GetGamesByDaysSorted(scheduledGames, dayBuffer) {
        let games = [];
        const todaysUTC = DateHelper_1.DateHelper.ConvertDateToUTC(new Date());
        var positive = dayBuffer > 0;
        var absoluteValue = dayBuffer;
        if (!positive)
            absoluteValue = dayBuffer * -1;
        for (var schedule of scheduledGames) {
            let scheduledDate = new Date(+schedule.scheduledTime.startTime);
            let scheduledUTC = DateHelper_1.DateHelper.ConvertDateToUTC(scheduledDate);
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
    static GetDayDifference(firstDate, secondDate) {
        var ms = firstDate.getTime() - secondDate.getTime();
        var inFuture = true;
        if (ms < 0) {
            inFuture = false;
            ms *= -1;
        }
        var result = Math.floor(ms / 1000 / 60 / 60 / 24);
        return { dayCount: result, future: inFuture };
    }
    static GetGamesSorted(scheduledGames, daysInFuture = 1) {
        return ScheduleHelper.GetGamesByDaysSorted(scheduledGames, daysInFuture).map(g => g.schedule);
    }
    static SortGames(games) {
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
                return TeamSorter_1.TeamSorter.SortByDivision(s1Schedule.divisionDisplayName, s2Schedule.divisionDisplayName);
        });
    }
    static GetMessages(scheduledMatches) {
        return new Promise((resolver, rejector) => {
            var _a, _b;
            let messagesToSend = [];
            let scheduleContainer = null;
            let currentTime = '';
            let schedulesByDay = [];
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
                    scheduleContainer = new ScehduleContainer_1.ScheduleContainer(`**__${formattedDate}__**`);
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
                let scheduleMessage = new MessageHelper_1.MessageHelper('scheduleMessage');
                if (m.divisionDisplayName) {
                    scheduleMessage.AddNew(`${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}**`);
                }
                else if (m.title) {
                    scheduleMessage.AddNewLine(`**${m.title}**`);
                    scheduleMessage.AddNewLine(`**${m.home.teamName}** vs **${m.away.teamName}**`);
                }
                else {
                    scheduleMessage.AddNew(`**${m.home.teamName}** vs **${m.away.teamName}**`);
                }
                const twitchIndex = (_a = m.casterUrl) === null || _a === void 0 ? void 0 : _a.toLowerCase().indexOf("twitch");
                const youtubeIndex = (_b = m.casterUrl) === null || _b === void 0 ? void 0 : _b.toLowerCase().indexOf("youtube");
                if (twitchIndex >= 0) {
                    const twitchURL = m.casterUrl.slice(twitchIndex);
                    m.casterUrl = "https://www." + twitchURL;
                    scheduleMessage.AddNewLine(`[${m.casterName}](${m.casterUrl})`);
                }
                else if (youtubeIndex >= 0) {
                    const youtubeUrl = m.casterUrl.slice(youtubeIndex);
                    m.casterUrl = "https://www." + youtubeUrl;
                    scheduleMessage.AddNewLine(`[${m.casterName}](${m.casterUrl})`);
                }
                if (scheduleContainer)
                    scheduleContainer.AddSchedule(scheduleMessage);
            }
            for (var daySchedule of schedulesByDay) {
                daySchedule.GetAsStringArray().forEach(item => {
                    messagesToSend.push(item);
                });
            }
            resolver(messagesToSend);
        });
    }
}
exports.ScheduleHelper = ScheduleHelper;
class ScheduleInformation {
    constructor(days, schedule) {
        this.days = days;
        this.schedule = schedule;
    }
}
exports.ScheduleInformation = ScheduleInformation;
//# sourceMappingURL=ScheduleHelper.js.map