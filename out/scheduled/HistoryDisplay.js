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
                for (let history of team.history) {
                    const historyDate = new Date(+history.timestamp);
                    const historyUTC = historyDate.getTime();
                    const ms = todaysUTC - historyUTC;
                    const dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
                    if (dayDifference <= days) {
                        const dateString = historyDate.toLocaleString("en-US", options);
                        const historyMessage = `\u200B \u200B ${history.action}: ${history.target}`;
                        const collection = historyMap.get(dateString);
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
        result.push(rollingMessage);
        return result;
    }
    Group(list) {
        const map = new Map();
        list.forEach((item) => {
            const key = item.date;
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item.message]);
            }
            else {
                collection.push(item.message);
            }
        });
        return map;
    }
}
exports.HistoryDisplay = HistoryDisplay;
//# sourceMappingURL=HistoryDisplay.js.map