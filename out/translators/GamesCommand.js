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
exports.GamesCommand = void 0;
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const translatorBase_1 = require("./bases/translatorBase");
class GamesCommand extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["games"];
    }
    get description() {
        return "Will Return the games for the team of the person sending the command.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messageCommand = (message, _) => messageSender.DMMessage(message);
            this._multiMessageCommand = (messages, _) => messageSender.DMMessages(messages);
            if (detailed) {
                this._messageCommand = (message, storeMessage) => messageSender.SendMessage(message, storeMessage);
                this._multiMessageCommand = (messages, storeMessage) => messageSender.SendMessages(messages, storeMessage);
            }
            let messages;
            if (commands.length <= 0) {
                messages = yield this.GetMessagesForMessageSender(messageSender);
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
                if (!detailed) {
                    messageSender.originalMessage.delete();
                }
            }
        });
    }
    GetMessagesForMessageSender(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const ngsUser = yield DiscordFuzzySearch_1.DiscordFuzzySearch.GetNGSUser(messageSender.Requester, yield this.liveDataStore.GetUsers());
            if (!ngsUser) {
                yield this._messageCommand("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.");
                return;
            }
            const team = yield this.GetTeam(ngsUser);
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
            let games = ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.liveDataStore.GetSchedule());
            games = games.filter(game => game.home.teamName == ngsTeam.teamName || game.away.teamName == ngsTeam.teamName);
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(games);
        });
    }
}
exports.GamesCommand = GamesCommand;
//# sourceMappingURL=GamesCommand.js.map