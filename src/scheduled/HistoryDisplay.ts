import { tagged } from "inversify";
import { stringify } from "querystring";
import { NGSDivisions } from "../enums/NGSDivisions";
import { HistoryActions } from "../enums/NGSHistoryActions";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { MessageHelper } from "../helpers/MessageHelper";
import { TeamSorter } from "../helpers/TeamSorter";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam } from "../interfaces";
import { IHistoryMessages } from "../interfaces/IHistoryMessage";
import { INGSHistory } from "../interfaces/INGSHistory";
import { LiveDataStore } from "../LiveDataStore";

export class HistoryDisplay {

    private _historyStartDate = "02-02-2025";
    constructor(private dataStore: DataStoreWrapper) {
    }

    public async GetRecentHistory(days: number): Promise<string[]> {
        const teams = await this.dataStore.GetTeams();
        const todaysUTC = new Date().getTime();
        const validHistories: HistoryContainer[] = [];
        for (let team of teams.GetTeamsSortedByDivision()) {
            const historyContainer = new HistoryContainer(team);
            const sortedHistory = team.history.sort((h1, h2) => h1.timestamp - h2.timestamp)
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
    }

    public async GetTeamsCreatedThisSeason(season: number): Promise<string[]> {
        const teams = await this.dataStore.GetTeams();
        const beginningMessage = "**New Teams this season** \n"
        let message = beginningMessage;
        let messages: string[] = [];
        for (let team of teams.GetTeamsSortedByTeamNames()) {
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
    }

    private GetRosterAddNumber(history: INGSHistory, sortedHistory: INGSHistory[]) {
        var addsSoFar = 0;
        var currentHistoryIndex = sortedHistory.indexOf(history);
        for (var indexedHistory of sortedHistory) {
            if (this.IsHistoryNewSeasonRecord(indexedHistory)) {
                if (currentHistoryIndex > addsSoFar)
                    return 0;
                else
                    break;
            }
            if (indexedHistory.action == HistoryActions.JoinedTeam) {
                addsSoFar++;
            }
        }
        return addsSoFar - currentHistoryIndex;
    }

    private IsHistoryNewSeasonRecord(historyRecord: INGSHistory) {
        if (historyRecord.action == HistoryActions.AddedDivision)
            return true;
        
        if(historyRecord.season && historyRecord.season != +LiveDataStore.season)
            return true;

        var historyDate = new Date(historyRecord.timestamp);
        var seasonStartDate = new Date(this._historyStartDate);
        if (historyDate <= seasonStartDate) {
            return true;
        }
        return false;
    }

    private FormatMessages(histories: HistoryContainer[]): string[] {
        let result: string[] = [];
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


class HistoryContainer {
    private Information: Map<number, HistoryInformation[]>;
    public get HasHistories() {
        return this.Information.size > 0;
    }

    constructor(public Team: INGSTeam) {
        this.Information = new Map<number, HistoryInformation[]>();
    }

    public AddHistory(historyInformation: HistoryInformation) {
        const key = historyInformation.History.timestamp;
        if (this.Information.has(key)) {
            this.Information[key].push(historyInformation);
        } else {
            this.Information.set(key, [historyInformation]);
        }
    }

    public GetMessage(): MessageHelper<any> {
        let currentMessage = new MessageHelper('HistoryContainer')
        currentMessage.AddNewLine(`**[${this.Team.divisionDisplayName}] - ${this.Team.teamName}**`);
        for (var mapkey of this.Information.keys()) {
            let key = this.Information.get(mapkey);
            if (key) {
                for (var historyInformaiton of key) {
                    currentMessage.AddNewLine(historyInformaiton.GetMessage().CreateStringMessage());
                }
            }
        }
        currentMessage.AddNewLine('');
        return currentMessage;
    }
}

class HistoryInformation {
    public RosterAddNumber: number;

    constructor(public History: INGSHistory) {

    }

    public GetMessage(): MessageHelper<any> {
        let messageHelper = new MessageHelper('HistoryInformation');
        if (this.RosterAddNumber > 0)
            messageHelper.AddNewLine(`${this.History.target} - Roster Add #${this.RosterAddNumber}`, 2)
        else
            messageHelper.AddNewLine(`${this.History.target} - ${this.History.action}`, 2);
        return messageHelper;
    }
}