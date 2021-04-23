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
const MessageHelper_1 = require("../helpers/MessageHelper");
const TeamSorter_1 = require("../helpers/TeamSorter");
class HistoryDisplay {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.dataStore = dependencies.dataStore;
    }
    GetRecentHistory(days) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.dataStore.GetTeams();
            const todaysUTC = new Date().getTime();
            const validHistories = [];
            for (let team of teams.sort((t1, t2) => TeamSorter_1.TeamSorter.SortByTeamDivision(t1, t2))) {
                const historyContainer = new HistoryContainer(team);
                const sortedHistory = team.history.sort((h1, h2) => h1.timestamp - h2.timestamp);
                const reversedHistory = sortedHistory.slice().reverse();
                for (let history of sortedHistory) {
                    const historyDate = new Date(+history.timestamp);
                    const historyUTC = historyDate.getTime();
                    const ms = todaysUTC - historyUTC;
                    const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
                    if (dayDifference < days) {
                        const historyInformation = new HistoryInformation(history);
                        if (history.action == HistoryActions.JoinedTeam) {
                            var numberOfRosterAdd = this.GetRosterAddNumber(history, reversedHistory);
                            if (numberOfRosterAdd > 0) {
                                historyInformation.RosterAddNumber = numberOfRosterAdd;
                            }
                        }
                        historyContainer.AddHistory(historyInformation);
                    }
                }
                if (historyContainer.HasHistories) {
                    validHistories.push(historyContainer);
                }
            }
            return this.FormatMessages(validHistories);
        });
    }
    GetTeamsCreatedThisSeason(season) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.dataStore.GetTeams();
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
    FormatMessages(histories) {
        let result = [];
        let rollingMessage = "";
        for (var history of histories) {
            let currentMessage = history.GetMessage().CreateStringMessage();
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
class HistoryContainer {
    constructor(Team) {
        this.Team = Team;
        this.Information = new Map();
    }
    get HasHistories() {
        return this.Information.size > 0;
    }
    AddHistory(historyInformation) {
        const key = historyInformation.History.timestamp;
        if (this.Information.has(key)) {
            this.Information[key].push(historyInformation);
        }
        else {
            this.Information.set(key, [historyInformation]);
        }
    }
    GetMessage() {
        let currentMessage = new MessageHelper_1.MessageHelper('HistoryContainer');
        currentMessage.AddNewLine(`**[${this.Team.divisionDisplayName}] - ${this.Team.teamName}**`);
        for (var mapkey of this.Information.keys()) {
            for (var historyInformaiton of this.Information.get(mapkey)) {
                currentMessage.AddNewLine(historyInformaiton.GetMessage().CreateStringMessage());
            }
        }
        currentMessage.AddNewLine('');
        return currentMessage;
    }
}
class HistoryInformation {
    constructor(History) {
        this.History = History;
    }
    GetMessage() {
        let messageHelper = new MessageHelper_1.MessageHelper('HistoryInformation');
        if (this.RosterAddNumber > 0)
            messageHelper.AddNewLine(`${this.History.target} - Roster Add #${this.RosterAddNumber}`, 2);
        else
            messageHelper.AddNewLine(`${this.History.target} - ${this.History.action}`, 2);
        return messageHelper;
    }
}
//# sourceMappingURL=HistoryDisplay.js.map