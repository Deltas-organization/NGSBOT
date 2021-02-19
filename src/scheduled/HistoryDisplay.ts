import { tagged } from "inversify";
import { stringify } from "querystring";
import { MessageHelper } from "../helpers/MessageHelper";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam } from "../interfaces";
import { IHistoryMessages } from "../interfaces/IHistoryMessage";
import { INGSHistory } from "../interfaces/INGSHistory";
import { LiveDataStore } from "../LiveDataStore";

export class HistoryDisplay {
    private liveDataStore: LiveDataStore;

    constructor(public dependencies: TranslatorDependencies) {
        this.liveDataStore = dependencies.liveDataStore;
    }

    public async GetRecentHistory(days: number): Promise<string[]> {
        const teams = await this.liveDataStore.GetTeams();
        const todaysUTC = new Date().getTime();
        const validHistories: HistoryContainer[] = [];
        for (let team of teams.sort((t1, t2) => this.TeamSort(t1, t2))) {
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
        const teams = await this.liveDataStore.GetTeams();
        const beginningMessage = "**New Teams this season** \n"
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
    }

    GetRosterAddNumber(history: INGSHistory, sortedHistory: INGSHistory[]) {
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

    private FormatMessages(histories: HistoryContainer[]): string[] {
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

    private TeamSort(team1: INGSTeam, team2: INGSTeam): number {
        const order = ["Storm", "Heroic", "Nexus", "A E", "A W", "B SouthEast", "B NorthEast", "B W", "C E", "C W", "D E", "D W", "E E", "E W"];
        for (var current of order) {
            if (team1.divisionDisplayName.indexOf(current) > -1) {
                return -1;
            }
            else if (team2.divisionDisplayName.indexOf(current) > -1) {
                return 1;
            }
        }

        return 0;
    }
}

enum HistoryActions {
    JoinedTeam = "Joined team",
    AddedDivision = "Added to division",
    CreatedTeam = "Team Created"
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        let currentMessage = new MessageHelper('HistoryContainer')
        currentMessage.AddNewLine(`**[${this.Team.divisionDisplayName}] - ${this.Team.teamName}**`);
        for (var mapkey of this.Information.keys()) {
            const friendlyName = new Date(+mapkey).toLocaleString("en-US", options);
            //currentMessage.AddNewLine(friendlyName);
            for (var historyInformaiton of this.Information.get(mapkey)) {
                currentMessage.AddNewLine(historyInformaiton.GetMessage().CreateStringMessage());
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