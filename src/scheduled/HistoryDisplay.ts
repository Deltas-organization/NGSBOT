import { stringify } from "querystring";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { IHistoryMessages } from "../interfaces/IHistoryMessage";
import { INGSHistory } from "../interfaces/INGSHistory";
import { LiveDataStore } from "../LiveDataStore";

export class HistoryDisplay
{
    private liveDataStore: LiveDataStore;

    constructor(public dependencies: TranslatorDependencies)
    {
        this.liveDataStore = dependencies.liveDataStore;
    }

    public async GetRecentHistory(days: number): Promise<string[]>
    {
        const teams = await this.liveDataStore.GetTeams();
        const todaysUTC = new Date().getTime();
        const historyMaps: { team: string, historymap: Map<string, string[]> }[] = [];
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        for (let team of teams)
        {
            const historyMap = new Map<string, string[]>();
            const sortedHistory = team.history.sort((h1, h2) => h1.timestamp - h2.timestamp)
            const reversedHistory = sortedHistory.slice().reverse();
            for (let history of sortedHistory)
            {
                const historyDate = new Date(+history.timestamp);
                const historyUTC = historyDate.getTime();

                const ms = todaysUTC - historyUTC;
                const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
                if (dayDifference <= days)
                {
                    const dateString = historyDate.toLocaleString("en-US", options);
                    let historyMessage = `\u200B \u200B ${history.action}: ${history.target}`;
                    const collection = historyMap.get(dateString);
                    if (history.action == HistoryActions.JoinedTeam)
                    {
                        var numberOfRosterAdd = this.GetRosterAddNumber(history, reversedHistory);
                        if (numberOfRosterAdd > 0)
                            historyMessage = `\u200B \u200B Roster Add #${numberOfRosterAdd}: ${history.target}`
                    }
                    if (!collection)
                    {
                        historyMap.set(dateString, [historyMessage]);
                    } else
                    {
                        collection.push(historyMessage);
                    }
                }
            }
            if (historyMap.size > 0)
            {
                historyMaps.push({ team: team.teamName, historymap: historyMap });
            }
        }

        return this.FormatMessages(historyMaps);
    }

    public async GetTeamsCreatedThisSeason(season: number): Promise<string[]>
    {        
        const teams = await this.liveDataStore.GetTeams();
        const beginningMessage = "**New Teams this season** \n"
        let message = beginningMessage;
        let messages = [];
        for (let team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName)))
        {
            for (let history of team.history)
            {
                if(history.action == HistoryActions.CreatedTeam)
                {
                    if(history.season == season)
                    {                        
                        let teamMessage = `\u200B \u200B ${team.teamName} \n`;
                        if(teamMessage.length + message.length > 2048)
                        {
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

    GetRosterAddNumber(history: INGSHistory, sortedHistory: INGSHistory[])
    {
        var addsSoFar = 0;
        var currentHistoryIndex = sortedHistory.indexOf(history);
        for (var indexedHistory of sortedHistory)
        {
            if (indexedHistory.action == HistoryActions.JoinedTeam)
            {
                addsSoFar++;
            }
            if (indexedHistory.action == HistoryActions.AddedDivision)
            {
                if (currentHistoryIndex > addsSoFar)
                    return 0;
                else
                    break;
            }
        }
        return addsSoFar - currentHistoryIndex;
    }

    private FormatMessages(messages: { team: string, historymap: Map<string, string[]> }[]): string[]
    {
        let result = [];
        let rollingMessage = "";
        for (var message of messages)
        {
            let currentMessage = `**${message.team}** \n`;
            let map = message.historymap;
            for (var mapkey of map.keys())
            {
                currentMessage += `${mapkey} \n`;
                for (var individualMessage of map.get(mapkey))
                {
                    currentMessage += `${individualMessage} \n`;
                }
            }
            currentMessage += "\n";
            if (rollingMessage.length + currentMessage.length > 2048)
            {
                result.push(rollingMessage);
                rollingMessage = currentMessage;
            }
            else
            {
                rollingMessage += currentMessage;
            }
        }
        result.push(rollingMessage);
        return result;
    }
}

enum HistoryActions
{
    JoinedTeam = "Joined team",
    AddedDivision = "Added to division",
    CreatedTeam = "Team Created"
}