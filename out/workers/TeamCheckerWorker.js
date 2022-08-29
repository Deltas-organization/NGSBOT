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
exports.TeamCheckerWorker = void 0;
const TranslationHelpers_1 = require("../helpers/TranslationHelpers");
const MessageContainer_1 = require("../message-helpers/MessageContainer");
const WorkerBase_1 = require("./Bases/WorkerBase");
const SearchPlayersWorker_1 = require("./SearchPlayersWorker");
class TeamCheckerWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            const foundTeams = [];
            var reactionsWaiting = [];
            var number = parseInt(commands[0]);
            var searchMethod = (term) => this.SearchForRegisteredTeams(term);
            if (!isNaN(number)) {
                searchMethod = (term) => this.SearchForTeamBySeason(number, term);
                commands.shift();
                if (commands.length < 1)
                    yield this.messageSender.SendMessage("invalid search");
            }
            for (var i = 0; i < commands.length; i++) {
                const fields = [];
                const searchTerm = commands[i];
                const teams = yield searchMethod(searchTerm);
                if (!teams || teams.length <= 0) {
                    fields.push({ name: `No teams found for  \n`, value: searchTerm });
                    yield this.messageSender.SendFields(``, fields);
                }
                else {
                    for (var team of teams) {
                        if (foundTeams.indexOf(team) > -1)
                            continue;
                        foundTeams.push(team);
                        let teamMessage = this.GetTeamMessage(team);
                        let sentMessage = yield this.messageSender.SendFields(``, teamMessage);
                        var reactionPromise = this.reactToMessage(sentMessage, team);
                        reactionsWaiting.push(reactionPromise);
                    }
                }
            }
            yield Promise.all(reactionsWaiting);
        });
    }
    reactToMessage(sentMessage, team) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sentMessage.react('✅');
            const filter = (reaction, user) => {
                if (user.bot)
                    return false;
                if (reaction.emoji.name) {
                    if (['✅'].includes(reaction.emoji.name))
                        return true;
                }
                return false;
            };
            var result = yield sentMessage.awaitReactions({ filter, max: 1, time: 3e4 });
            if (result.size > 0)
                this.DisplayPlayerInformation(team);
        });
    }
    GetTeamMessage(team) {
        let result = [];
        result.push({ name: "TeamName", value: `\u0009 ${TranslationHelpers_1.Translationhelpers.GetTeamURL(team.teamName)}`, inline: true });
        result.push({ name: "Division", value: `\u0009 ${team.divisionDisplayName}`, inline: true });
        result.push({ name: "Description", value: `\u0009 ${team.descriptionOfTeam} -`, inline: true });
        let firstValueArray = [];
        let secondValueArray = [];
        let thirdValueArray = [];
        let playerLength = team.teamMembers.length;
        for (var i = 0; i < playerLength; i += 3) {
            let player = team.teamMembers[i];
            firstValueArray.push(this.AddPlayerMessage(player));
            if (i + 1 < playerLength) {
                player = team.teamMembers[i + 1];
                secondValueArray.push(this.AddPlayerMessage(player));
            }
            if (i + 2 < playerLength) {
                player = team.teamMembers[i + 2];
                thirdValueArray.push(this.AddPlayerMessage(player));
            }
        }
        result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
        return result;
    }
    AddPlayerMessage(player) {
        return '\u0009' + player.displayName.split("#")[0];
    }
    DisplayPlayerInformation(team) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.dataStore.GetUsers();
            const foundUsers = [];
            for (let user of users) {
                if (user.teamName == team.teamName)
                    foundUsers.push(user);
            }
            const container = new MessageContainer_1.MessageContainer();
            const message = SearchPlayersWorker_1.SearchPlayersWorker.CreatePlayerMessage(foundUsers, false);
            container.Append(message);
            yield this.messageSender.SendMessageFromContainer(container);
        });
    }
}
exports.TeamCheckerWorker = TeamCheckerWorker;
//# sourceMappingURL=TeamCheckerWorker.js.map