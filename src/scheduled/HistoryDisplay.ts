import { stringify } from "querystring";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { IHistoryMessages } from "../interfaces/IHistoryMessage";
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
            for (let history of team.history)
            {
                const historyDate = new Date(+history.timestamp);
                const historyUTC = historyDate.getTime();

                const ms = todaysUTC - historyUTC;
                const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
                if (dayDifference <= days)
                {
                    const dateString = historyDate.toLocaleString("en-US", options);
                    const historyMessage = `\u200B \u200B ${history.action}: ${history.target}`;
                    const collection = historyMap.get(dateString);
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
    private Group(list: { date: string, message: string }[])
    {
        const map = new Map();
        list.forEach((item) =>
        {
            const key = item.date;
            const collection = map.get(key);
            if (!collection)
            {
                map.set(key, [item.message]);
            } else
            {
                collection.push(item.message);
            }
        });
        return map;
    }
}