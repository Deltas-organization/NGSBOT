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
exports.ScheduleLister = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const globals_1 = require("../globals");
class ScheduleLister extends adminTranslatorBase_1.AdminTranslatorBase {
    constructor(translatorDependencies, liveDataStore) {
        super(translatorDependencies);
        this.liveDataStore = liveDataStore;
    }
    get commandBangs() {
        return ["Schedule", "sch"];
    }
    get description() {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }
    getGameMessagesForToday() {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield this.getfilteredGames(0, 0);
            if (filteredGames.length <= 0) {
                globals_1.Globals.log("No games available for today.");
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
            let filteredGames = yield this.getfilteredGames(duration, endDays);
            let messages = yield this.getMessages(filteredGames);
            for (var index = 0; index < messages.length; index++) {
                yield messageSender.SendMessage(messages[index]);
            }
            yield messageSender.originalMessage.delete();
        });
    }
    getfilteredGames(daysInFuture, daysInFutureClamp) {
        return __awaiter(this, void 0, void 0, function* () {
            var todaysUTC = new Date().getTime();
            let scheduledGames = yield this.liveDataStore.GetSchedule();
            let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture, daysInFutureClamp));
            filteredGames = filteredGames.sort((f1, f2) => {
                let result = f1.DaysAhead - f2.DaysAhead;
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
        });
    }
    filterSchedule(todaysUTC, schedule, daysInFuture, daysInFutureClamp) {
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
    sortSchedule(filteredGames) {
        return filteredGames.sort((f1, f2) => {
            let result = f1.DaysAhead - f2.DaysAhead;
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
                let minutes = scheduledDateUTC.getMinutes();
                if (minutes == 0)
                    minutes = "00";
                let newMessage = '';
                if (currentDaysAhead != m.DaysAhead) {
                    dayGroupMessages.push(message);
                    let date = scheduledDateUTC.getUTCDate();
                    if (hours >= 19)
                        date -= 1;
                    message = "";
                    newMessage = `\n**__${scheduledDateUTC.getMonth() + 1}/${date}__** \n`;
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
exports.ScheduleLister = ScheduleLister;
//# sourceMappingURL=ScheduleLister.js.map