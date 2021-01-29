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
exports.HistoryDisplay = void 0;
class HistoryDisplay {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.liveDataStore = dependencies.liveDataStore;
    }
    GetRecentHistory(days) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.liveDataStore.GetTeams();
            const todaysUTC = new Date().getTime();
            const historyMaps = [];
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            for (let team of teams) {
                const historyMap = new Map();
                const sortedHistory = team.history.sort((h1, h2) => h1.timestamp - h2.timestamp);
                const reversedHistory = sortedHistory.slice().reverse();
                for (let history of sortedHistory) {
                    const historyDate = new Date(+history.timestamp);
                    const historyUTC = historyDate.getTime();
                    const ms = todaysUTC - historyUTC;
                    const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
                    if (dayDifference <= days) {
                        const dateString = historyDate.toLocaleString("en-US", options);
                        let historyMessage = `\u200B \u200B ${history.action}: ${history.target}`;
                        const collection = historyMap.get(dateString);
                        if (history.action == HistoryActions.JoinedTeam) {
                            var numberOfRosterAdd = this.GetRosterAddNumber(history, reversedHistory);
                            if (numberOfRosterAdd > 0)
                                historyMessage = `\u200B \u200B Roster Add #${numberOfRosterAdd}: ${history.target}`;
                        }
                        if (!collection) {
                            historyMap.set(dateString, [historyMessage]);
                        }
                        else {
                            collection.push(historyMessage);
                        }
                    }
                }
                if (historyMap.size > 0) {
                    historyMaps.push({ team: team.teamName, historymap: historyMap });
                }
            }
            return this.FormatMessages(historyMaps);
        });
    }
    GetTeamsCreatedThisSeason(season) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.liveDataStore.GetTeams();
            const beginningMessage = "**New Teams this season** \n";
            let message = beginningMessage;
            let messages = [];
            for (let team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                for (let history of team.history) {
                    if (history.action == HistoryActions.CreatedTeam) {
                        if (history.season == season) {
                            let teamMessage = `\u200B \u200B ${team.teamName} \n`;
                            if (teamMessage.length + message.length > 2048) {
                                messages.push(message);
                                message = beginningMessage;
                            }
                            message += teamMessage;
                        }
                    }
                }
            }
            messages.push(message);
            return messages;
        });
    }
    GetRosterAddNumber(history, sortedHistory) {
        var addsSoFar = 0;
        var currentHistoryIndex = sortedHistory.indexOf(history);
        for (var indexedHistory of sortedHistory) {
            if (indexedHistory.action == HistoryActions.JoinedTeam) {
                addsSoFar++;
            }
            if (indexedHistory.action == HistoryActions.AddedDivision) {
                if (currentHistoryIndex > addsSoFar)
                    return 0;
                else
                    break;
            }
        }
        return addsSoFar - currentHistoryIndex;
    }
    FormatMessages(messages) {
        let result = [];
        let rollingMessage = "";
        for (var message of messages) {
            let currentMessage = `**${message.team}** \n`;
            let map = message.historymap;
            for (var mapkey of map.keys()) {
                currentMessage += `${mapkey} \n`;
                for (var individualMessage of map.get(mapkey)) {
                    currentMessage += `${individualMessage} \n`;
                }
            }
            currentMessage += "\n";
            if (rollingMessage.length + currentMessage.length > 2048) {
                result.push(rollingMessage);
                rollingMessage = currentMessage;
            }
            else {
                rollingMessage += currentMessage;
            }
        }
        if (rollingMessage)
            result.push(rollingMessage);
        return result;
    }
}
exports.HistoryDisplay = HistoryDisplay;
var HistoryActions;
(function (HistoryActions) {
    HistoryActions["JoinedTeam"] = "Joined team";
    HistoryActions["AddedDivision"] = "Added to division";
    HistoryActions["CreatedTeam"] = "Team Created";
})(HistoryActions || (HistoryActions = {}));
//# sourceMappingURL=HistoryDisplay.js.map