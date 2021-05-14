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
exports.GamesWorker = void 0;
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const WorkerBase_1 = require("./Bases/WorkerBase");
class GamesWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messageCommand = (message, _) => this.messageSender.DMMessage(message);
            this._multiMessageCommand = (messages, _) => this.messageSender.DMMessages(messages);
            if (this.detailed) {
                this._messageCommand = (message, storeMessage) => this.messageSender.SendMessage(message, storeMessage);
                this._multiMessageCommand = (messages, storeMessage) => this.messageSender.SendMessages(messages, storeMessage);
            }
            let messages;
            if (commands.length <= 0) {
                messages = yield this.GetMessagesForMessageSender();
            }
            else {
                messages = yield this.GetMessagesForTeam(commands.join(" "));
            }
            if (messages) {
                if (messages.length > 0)
                    yield this._multiMessageCommand(messages);
                else {
                    var random1 = Math.round(Math.random() * 99) + 1;
                    if (random1 == 65) {
                        yield this._messageCommand("Borntoshine has been notified of your failings.");
                    }
                    else {
                        yield this._messageCommand("Nothing scheduled yet.");
                    }
                }
                if (!this.detailed) {
                    this.messageSender.originalMessage.delete();
                }
            }
        });
    }
    GetMessagesForMessageSender() {
        return __awaiter(this, void 0, void 0, function* () {
            const ngsUser = yield DiscordFuzzySearch_1.DiscordFuzzySearch.GetNGSUser(this.messageSender.Requester, yield this.dataStore.GetUsers());
            if (!ngsUser) {
                yield this._messageCommand("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.");
                return;
            }
            const team = yield this.dataStore.LookForTeam(ngsUser);
            if (!team) {
                yield this._messageCommand("Unable to find your ngsTeam");
                return;
            }
            let result = [];
            const teamMessage = yield this.CreateTeamMessage(team);
            result.push(teamMessage.CreateStringMessage());
            result = result.concat(yield this.GetScheduleMessages(team));
            return result;
        });
    }
    GetMessagesForTeam(teamSearchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            let teams = yield this.SearchforTeams(teamSearchTerm);
            if (teams.length < 1)
                return ["No team found"];
            else if (teams.length > 1)
                return ["More then one team returned."];
            const team = teams[0];
            let result = [];
            const teamMessage = yield this.CreateTeamMessage(team);
            result.push(teamMessage.CreateStringMessage());
            result = result.concat(yield this.GetScheduleMessages(team));
            return result;
        });
    }
    CreateTeamMessage(ngsTeam) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = new MessageHelper_1.MessageHelper("Team");
            message.AddNew(`Games for: **${ngsTeam.teamName}**`);
            message.AddEmptyLine();
            return message;
        });
    }
    GetScheduleMessages(ngsTeam) {
        return __awaiter(this, void 0, void 0, function* () {
            let games = ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.dataStore.GetSchedule());
            games = games.filter(game => game.home.teamName == ngsTeam.teamName || game.away.teamName == ngsTeam.teamName);
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(games);
        });
    }
}
exports.GamesWorker = GamesWorker;
//# sourceMappingURL=GamesWorker.js.map