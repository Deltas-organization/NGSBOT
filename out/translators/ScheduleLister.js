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
class ScheduleLister extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["Schedule", "sch"];
    }
    get description() {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }
    getGameMessagesForToday() {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.GetGames();
            if (filteredGames.length <= 0) {
                Globals_1.Globals.log("No games available for today.");
                return;
            }
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
        });
    }
    getGameMessagesForTodayByDivision(ngsDivision) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.GetGames();
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
                duration = parsedNumber - 1;
            }
            else if (commands.length == 2) {
                yield this.SearchByDivision(commands, messageSender);
                return;
            }
            let filteredGames = yield this.GetGames(duration);
            let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
            for (var index = 0; index < messages.length; index++) {
                yield messageSender.SendMessage(messages[index]);
            }
            yield messageSender.originalMessage.delete();
        });
    }
    GetGames(daysInFuture = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let games = yield ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.liveDataStore.GetSchedule());
            games = games.filter(s => ScheduleHelper_1.ScheduleHelper.GetGamesBetweenDates(s, daysInFuture));
            return games;
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
            let scheduledGames = yield this.GetGames();
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