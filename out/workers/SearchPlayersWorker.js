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
exports.SearchPlayersWorker = void 0;
const NGSHistoryActions_1 = require("../enums/NGSHistoryActions");
const TranslationHelpers_1 = require("../helpers/TranslationHelpers");
const MessageContainer_1 = require("../message-helpers/MessageContainer");
const WorkerBase_1 = require("./Bases/WorkerBase");
class SearchPlayersWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            var container = new MessageContainer_1.MessageContainer();
            for (var i = 0; i < commands.length; i++) {
                var playerName = commands[i];
                if (this.detailed)
                    var players = yield this.SearchForPlayersByAPI(playerName);
                else
                    var players = yield this.SearchForPlayersInCurrentSeason(playerName);
                if (players.length <= 0)
                    container.AddSimpleGroup(`**No players found for: ${playerName}**`);
                else
                    container.Append(SearchPlayersWorker.CreatePlayerMessage(players, this.detailed));
            }
            yield this.messageSender.SendMessageFromContainer(container);
        });
    }
    SearchForPlayersByAPI(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dataStore.GetUsersByApi(searchTerm);
        });
    }
    static CreatePlayerMessage(players, detailed) {
        var result = [];
        players.forEach(player => {
            const message = new MessageContainer_1.MessageGroup();
            message.AddOnNewLine(`**Name**: ${player.displayName}`);
            if (player.teamName)
                message.AddOnNewLine(`**TeamName**: ${TranslationHelpers_1.Translationhelpers.GetTeamURL(player.teamName)}`);
            else
                message.AddOnNewLine("**No Team Found**");
            var maxSeasonCount = 4;
            for (var rank of player.verifiedRankHistory.sort(SearchPlayersWorker.RankHistorySort).slice(0, maxSeasonCount)) {
                if (rank.status == 'verified')
                    message.AddOnNewLine(`${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}**`);
            }
            if (detailed) {
                message.Combine(SearchPlayersWorker.CreateDetailedMessage(player));
            }
            result.push(message);
        });
        return result;
    }
    static CreateDetailedMessage(player) {
        let message = new MessageContainer_1.MessageGroup();
        for (var history of player.history.sort((h1, h2) => h2.timestamp - h1.timestamp)) {
            if (history.season) {
                if (history.action == NGSHistoryActions_1.HistoryActions.LeftTeam) {
                    message.AddOnNewLine(`**Left Team**: ${history.target}. Season: ${history.season}`);
                }
                else if (history.action == NGSHistoryActions_1.HistoryActions.JoinedTeam) {
                    message.AddOnNewLine(`**Joined Team**: ${history.target}. Season: ${history.season}`);
                }
                else if (history.action == NGSHistoryActions_1.HistoryActions.CreatedTeam) {
                    message.AddOnNewLine(`**Created Team**: ${history.target}. Season: ${history.season}`);
                }
            }
        }
        return message;
    }
    static RankHistorySort(history1, history2) {
        if (history1.year > history2.year)
            return -1;
        else if (history1.year < history2.year)
            return 1;
        if (history1.season > history2.season)
            return -1;
        else
            return 1;
    }
}
exports.SearchPlayersWorker = SearchPlayersWorker;
//# sourceMappingURL=SearchPlayersWorker.js.map