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
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const DateHelper_1 = require("../helpers/DateHelper");
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
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
        });
    }
    getGameMessagesForTodayByDivision(ngsDivision) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.GetGames(0, 0);
            filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
            if (filteredGames.length <= 0) {
                return;
            }
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
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
                endDays = -1;
            }
            else if (commands.length == 2) {
                yield this.SearchByDivision(commands, messageSender);
                return;
            }
            let filteredGames = yield this.GetGames(duration, endDays);
            let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
            for (var index = 0; index < messages.length; index++) {
                yield messageSender.SendMessage(messages[index]);
            }
            yield messageSender.originalMessage.delete();
        });
    }
    GetGames(daysInFuture, daysInFutureClamp) {
        return __awaiter(this, void 0, void 0, function* () {
            let games = yield ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.liveDataStore.GetSchedule());
            let todaysUTC = DateHelper_1.DateHelper.ConvertDateToUTC(new Date());
            games = games.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture, daysInFutureClamp));
            return games;
        });
    }
    filterSchedule(todaysUTC, schedule, daysInFuture, daysInFutureClamp) {
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = DateHelper_1.DateHelper.ConvertDateToUTC(scheduledDate);
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
            let scheduledGames = yield this.GetGames(0, 0);
            scheduledGames = scheduledGames.filter(s => {
                if (!s.divisionConcat.startsWith(division))
                    return false;
                return true;
            });
            let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(scheduledGames);
            yield messageSender.SendMessages(messages);
        });
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