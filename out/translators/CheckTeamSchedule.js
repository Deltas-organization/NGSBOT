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
exports.CheckTeamSchedule = void 0;
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const translatorBase_1 = require("./bases/translatorBase");
class CheckTeamSchedule extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["games"];
    }
    get description() {
        return "Will Return the games for the team of the person sending the command.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const ngsUser = yield this.GetNGSUser(messageSender.Requester);
            if (!ngsUser) {
                yield messageSender.SendMessage("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.");
                return;
            }
            const team = yield this.GetTeam(ngsUser);
            if (!team) {
                yield messageSender.SendMessage("Unable to find your ngsTeam");
                return;
            }
            const messages = yield this.GetScheduleMessages(team);
            if (messages) {
                const messagesAsOne = messages.join('');
                if (messagesAsOne.trim().length > 0)
                    yield messageSender.SendMessage(messagesAsOne);
                else {
                    var random1 = Math.round(Math.random() * 99) + 1;
                    if (random1 == 65) {
                        yield messageSender.SendMessage("Borntoshine has been notified of your failings.");
                    }
                    else {
                        yield messageSender.SendMessage("Nothing scheduled yet.");
                    }
                }
            }
        });
    }
    GetNGSUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.liveDataStore.GetUsers();
            for (var ngsUser of users) {
                if (DiscordFuzzySearch_1.DiscordFuzzySearch.CompareGuildUser(ngsUser, user)) {
                    return ngsUser;
                }
            }
            return null;
        });
    }
    GetTeam(ngsUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.liveDataStore.GetTeams();
            for (var team of teams) {
                if (team.teamName == ngsUser.teamName) {
                    return team;
                }
            }
            return null;
        });
    }
    GetScheduleMessages(ngsTeam) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduledGames = yield this.liveDataStore.GetSchedule();
            const sortedGames = scheduledGames.sort((s1, s2) => {
                let f1Date = new Date(+s1.scheduledTime.startTime);
                let f2Date = new Date(+s2.scheduledTime.startTime);
                let timeDiff = f1Date.getTime() - f2Date.getTime();
                if (timeDiff > 0)
                    return 1;
                else if (timeDiff < 0)
                    return -1;
                return 0;
            });
            const todaysUTC = this.ConvertDateToUTC(new Date());
            const teamsGames = [];
            for (var schedule of sortedGames) {
                if (schedule.home.teamName == ngsTeam.teamName ||
                    schedule.away.teamName == ngsTeam.teamName) {
                    let scheduledDate = new Date(+schedule.scheduledTime.startTime);
                    let scheduledUTC = this.ConvertDateToUTC(scheduledDate);
                    var ms = scheduledUTC.getTime() - todaysUTC.getTime();
                    if (ms > 0) {
                        teamsGames.push(schedule);
                    }
                }
            }
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(teamsGames);
        });
    }
    ConvertDateToUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
exports.CheckTeamSchedule = CheckTeamSchedule;
//# sourceMappingURL=CheckTeamSchedule.js.map