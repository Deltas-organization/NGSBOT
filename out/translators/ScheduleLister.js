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
exports.ScheduleContainer = exports.ScheduleLister = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const Globals_1 = require("../Globals");
const TeamSorter_1 = require("../helpers/TeamSorter");
const MessageHelper_1 = require("../helpers/MessageHelper");
class ScheduleLister extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["Schedule", "sch"];
    }
    get description() {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }
    getGameMessagesForToday() {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.GetGames(0, 0);
            if (filteredGames.length <= 0) {
                Globals_1.Globals.log("No games available for today.");
                return;
            }
            return yield this.getMessages(filteredGames);
        });
    }
    getGameMessagesForTodayByDivision(ngsDivision) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.GetGames(0, 0);
            filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
            if (filteredGames.length <= 0) {
                return;
            }
            return yield this.getMessages(filteredGames);
        });
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            let duration = 0;
            let endDays = duration;
            if (commands.length == 1) {
                let parsedNumber = parseInt(commands[0]);
                if (isNaN(parsedNumber)) {
                    yield this.SearchByDivision(commands, messageSender);
                    return;
                }
                if (parsedNumber > 10) {
                    yield messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`);
                    return;
                }
                duration = parsedNumber;
                endDays = duration;
                if (detailed)
                    endDays = -1;
            }
            else if (commands.length == 2) {
                yield this.SearchByDivision(commands, messageSender);
                return;
            }
            let filteredGames = yield this.GetGames(duration, endDays);
            let messages = yield this.getMessages(filteredGames);
            for (var index = 0; index < messages.length; index++) {
                yield messageSender.SendMessage(messages[index]);
            }
            yield messageSender.originalMessage.delete();
        });
    }
    GetGames(daysInFuture, daysInFutureClamp) {
        return __awaiter(this, void 0, void 0, function* () {
            let filteredGames = yield this.getfilteredGames(daysInFuture, daysInFutureClamp);
            return yield this.sortSchedule(filteredGames);
        });
    }
    getfilteredGames(daysInFuture, daysInFutureClamp) {
        return __awaiter(this, void 0, void 0, function* () {
            var todaysUTC = this.ConvertDateToUTC(new Date());
            let scheduledGames = yield this.liveDataStore.GetSchedule();
            let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture, daysInFutureClamp));
            filteredGames = filteredGames.sort((f1, f2) => {
                let f1Date = new Date(+f1.scheduledTime.startTime);
                let f2Date = new Date(+f2.scheduledTime.startTime);
                let timeDiff = f1Date.getTime() - f2Date.getTime();
                if (timeDiff > 0)
                    return 1;
                else if (timeDiff < 0)
                    return -1;
                else
                    return TeamSorter_1.TeamSorter.SortByDivision(f1.divisionDisplayName, f2.divisionDisplayName);
            });
            return filteredGames;
        });
    }
    filterSchedule(todaysUTC, schedule, daysInFuture, daysInFutureClamp) {
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = this.ConvertDateToUTC(scheduledDate);
        var ms = scheduledUTC.getTime() - todaysUTC.getTime();
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
    ConvertDateToUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
    sortSchedule(filteredGames) {
        return filteredGames.sort((f1, f2) => {
            let f1Date = new Date(+f1.scheduledTime.startTime);
            let f2Date = new Date(+f2.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            else
                return TeamSorter_1.TeamSorter.SortByDivision(f1.divisionDisplayName, f2.divisionDisplayName);
        });
    }
    SearchByDivision(commands, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let scheduledGames = yield this.liveDataStore.GetSchedule();
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
            let messages = yield this.getMessages(filteredGames);
            for (var index = 0; index < messages.length; index++) {
                yield messageSender.SendMessage(messages[index]);
            }
        });
    }
    getMessages(scheduledMatches) {
        return new Promise((resolver, rejector) => {
            let messagesToSend = [];
            let scheduleContainer = null;
            let currentTime = -1;
            let schedulesByDay = [];
            let currentDay = -1;
            for (var i = 0; i < scheduledMatches.length; i++) {
                let m = scheduledMatches[i];
                let scheduledDateUTC = this.ConvertDateToUTC(new Date(+m.scheduledTime.startTime));
                let hours = scheduledDateUTC.getHours();
                if (hours <= 6)
                    hours = 24 - 6 + hours;
                else
                    hours -= 6;
                let minutes = scheduledDateUTC.getMinutes();
                if (minutes == 0)
                    minutes = "00";
                if (currentDay != scheduledDateUTC.getDay()) {
                    let date = scheduledDateUTC.getDate();
                    if (hours >= 19)
                        date -= 1;
                    scheduleContainer = new ScheduleContainer(`**__${scheduledDateUTC.getMonth() + 1}/${date}__**`);
                    schedulesByDay.push(scheduleContainer);
                    currentDay = scheduledDateUTC.getUTCDay();
                    currentTime = -1;
                }
                if (currentTime != hours + minutes) {
                    // if (currentTime != -1)
                    //     newMessage += '\n';
                    currentTime = hours + minutes;
                    let pmMessage = "am";
                    if (hours > 12) {
                        hours -= 12;
                        pmMessage = "pm";
                    }
                    let pacificMessage = this.GetPacificMessage(hours, minutes, pmMessage);
                    let mountainMessage = this.GetMountainMessage(hours, minutes, pmMessage);
                    let easternTime = this.GetEasternTime(hours, minutes, pmMessage);
                    let timeSection = `**${pacificMessage} P | ${mountainMessage} M | ${hours}:${minutes}${pmMessage} C | ${easternTime} M   E **`;
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
    GetPacificMessage(hours, minutes, endMessage) {
        if (hours == 2)
            return `${12}:${minutes}${endMessage}`;
        else if (hours == 1)
            return `${11}:${minutes}am`;
        else
            return `${hours - 2}:${minutes}${endMessage}`;
    }
    GetMountainMessage(hours, minutes, endMessage) {
        if (hours == 1)
            return `${12}:${minutes}${endMessage}`;
        else
            return `${hours - 1}:${minutes}${endMessage}`;
    }
    GetEasternTime(hours, minutes, pmMessage) {
        if (hours + 1 == 12) {
            pmMessage = "am";
        }
        return `${hours + 1}:${minutes}${pmMessage}`;
    }
}
exports.ScheduleLister = ScheduleLister;
class ScheduleContainer {
    constructor(dateTitle) {
        this.dateTitle = dateTitle;
        this._timeAndSchedules = new Map();
    }
    AddNewTimeSection(sectionTitle) {
        this._currentSection = sectionTitle;
        this._timeAndSchedules.set(sectionTitle, []);
    }
    AddSchedule(scheduleMessage) {
        this._timeAndSchedules.get(this._currentSection).push(scheduleMessage);
    }
    GetAsStringArray() {
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
                message = dateTitleString;
            }
            message += timeMessage;
        }
        result.push(message);
        return result;
    }
}
exports.ScheduleContainer = ScheduleContainer;
//# sourceMappingURL=ScheduleLister.js.map