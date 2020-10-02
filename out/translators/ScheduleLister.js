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
const translatorBase_1 = require("./bases/translatorBase");
class ScheduleLister extends translatorBase_1.TranslatorBase {
    constructor(client, NGSScheduleDataStore) {
        super(client);
        this.NGSScheduleDataStore = NGSScheduleDataStore;
    }
    get commandBangs() {
        return ["Schedule", "sch"];
    }
    get description() {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            let duration = 0;
            let endDays = duration;
            if (commands.length == 1) {
                let parsedNumber = parseInt(commands[0]);
                if (isNaN(parsedNumber)) {
                    yield messageSender.SendMessage(`the value provided is not a number: ${commands[0]}`);
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
            let filteredGames = yield this.getfilteredGames(duration, endDays);
            yield this.SendMessages(filteredGames, messageSender);
        });
    }
    getfilteredGames(daysInFuture, daysInFutureClamp) {
        return __awaiter(this, void 0, void 0, function* () {
            var todaysdate = new Date();
            var todaysUTC = Date.UTC(todaysdate.getFullYear(), todaysdate.getMonth(), todaysdate.getDate());
            let scheduledGames = yield this.NGSScheduleDataStore.GetSchedule();
            let filteredGames = scheduledGames.filter(s => this.filterSchedule(todaysUTC, s, daysInFuture + 1, daysInFutureClamp));
            filteredGames = filteredGames.sort((f1, f2) => {
                let result = f1.DaysAhead - f2.DaysAhead;
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
        });
    }
    filterSchedule(todaysUTC, schedule, daysInFuture, daysInFutureClamp) {
        let scheduledDate = new Date(+schedule.scheduledTime.startTime);
        let scheduledUTC = Date.UTC(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
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
    SendMessages(scheduledMatches, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = '';
            let currentDaysAhead = -1;
            let currentTime = -1;
            let dayGroupMessages = [];
            for (var i = 0; i < scheduledMatches.length; i++) {
                let m = scheduledMatches[i];
                let scheduledDate = new Date(+m.scheduledTime.startTime);
                let hours = scheduledDate.getHours();
                let minutes = scheduledDate.getMinutes();
                if (minutes == 0)
                    minutes = "00";
                let newMessage = '';
                if (currentDaysAhead != m.DaysAhead) {
                    dayGroupMessages.push(message);
                    message = "";
                    newMessage = `\n**__${scheduledDate.getMonth() + 1}/${scheduledDate.getDate()}__** \n`;
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
                    yield messageSender.SendMessage(message);
                    message = "";
                }
                message += groupMessage;
            }
            yield messageSender.SendMessage(message);
        });
    }
}
exports.ScheduleLister = ScheduleLister;
//# sourceMappingURL=ScheduleLister.js.map