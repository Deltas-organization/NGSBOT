"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleHelper = void 0;
const ScheduleLister_1 = require("../translators/ScheduleLister");
const MessageHelper_1 = require("./MessageHelper");
const moment = require("moment-timezone");
const DateHelper_1 = require("./DateHelper");
const TeamSorter_1 = require("./TeamSorter");
class ScheduleHelper {
    static GetFutureGamesSorted(scheduledGames) {
        let futureGames = [];
        const todaysUTC = DateHelper_1.DateHelper.ConvertDateToUTC(new Date());
        for (var schedule of scheduledGames) {
            let scheduledDate = new Date(+schedule.scheduledTime.startTime);
            let scheduledUTC = DateHelper_1.DateHelper.ConvertDateToUTC(scheduledDate);
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
                return TeamSorter_1.TeamSorter.SortByDivision(s1.divisionDisplayName, s2.divisionDisplayName);
        });
        return futureGames;
    }
    static GetMessages(scheduledMatches) {
        return new Promise((resolver, rejector) => {
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
                    scheduleContainer = new ScheduleLister_1.ScheduleContainer(`**__${formattedDate}__**`);
                    schedulesByDay.push(scheduleContainer);
                    currentDay = formattedDate;
                    currentTime = '';
                }
                if (currentTime != formattedTime) {
                    currentTime = formattedTime;
                    let timeSection = `**__${pacificDate.format('h:mma')} P | ${mountainDate.format('h:mma')} M | ${centralDate.format('h:mma')} C | ${easternDate.format('h:mma')} E __**`;
                    scheduleContainer.AddNewTimeSection(timeSection);
                }
                let scheduleMessage = new MessageHelper_1.MessageHelper('scheduleMessage');
                scheduleMessage.AddNewLine(`${m.divisionDisplayName} - **${m.home.teamName}** vs **${m.away.teamName}**`);
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
                });
            }
            resolver(messagesToSend);
        });
    }
}
exports.ScheduleHelper = ScheduleHelper;
//# sourceMappingURL=ScheduleHelper.js.map