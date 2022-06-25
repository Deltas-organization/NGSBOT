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
exports.SeasonInformationWorker = void 0;
const MessageContainer_1 = require("../message-helpers/MessageContainer");
const WorkerBase_1 = require("./Bases/WorkerBase");
class SeasonInformationWorker extends WorkerBase_1.WorkerBase {
    constructor(workerDependencies, detailed, messageSender) {
        super(workerDependencies, detailed, messageSender);
        this.detailed = detailed;
        this.messageSender = messageSender;
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._season = commands[0];
            var gamesPlayed = yield this.dataStore.GetGameInformationForSeason(this._season);
            yield this.DisplayBannedMaps(gamesPlayed);
        });
    }
    DisplayBannedMaps(gamesPlayed) {
        return __awaiter(this, void 0, void 0, function* () {
            const divisionInformation = this.CreateBannedMaps(gamesPlayed);
            const message = new MessageContainer_1.MessageContainer();
            message.AddSimpleGroup(`The banned maps for season ${this._season}:`);
            for (const item in divisionInformation) {
                const sortedMapInformation = this.SortBannedMaps(divisionInformation[item]);
                const messageGroup = this.CreateBannedMapMessage(sortedMapInformation);
                messageGroup.Prepend(`Division: ${item} \n`);
                message.Append(messageGroup);
            }
            yield this.messageSender.SendMessageFromContainer(message, true);
        });
    }
    CreateBannedMaps(gamesPlayed) {
        var divisionInformation = {};
        for (var game of gamesPlayed) {
            var divisionName = game.divisionConcat;
            if (!divisionInformation[divisionName])
                divisionInformation[divisionName] = {};
            var bannedMaps = divisionInformation[divisionName];
            if (game.mapBans) {
                if (!bannedMaps[game.mapBans.awayOne])
                    bannedMaps[game.mapBans.awayOne] = 0;
                if (!bannedMaps[game.mapBans.awayTwo])
                    bannedMaps[game.mapBans.awayTwo] = 0;
                if (!bannedMaps[game.mapBans.homeOne])
                    bannedMaps[game.mapBans.homeOne] = 0;
                if (!bannedMaps[game.mapBans.homeTwo])
                    bannedMaps[game.mapBans.homeTwo] = 0;
                bannedMaps[game.mapBans.awayOne]++;
                bannedMaps[game.mapBans.awayTwo]++;
                bannedMaps[game.mapBans.homeOne]++;
                bannedMaps[game.mapBans.homeTwo]++;
            }
            else {
            }
        }
        return divisionInformation;
    }
    CreateBannedMapMessage(allBannedInformation) {
        const group = new MessageContainer_1.MessageGroup();
        for (const item of allBannedInformation) {
            group.AddOnNewLine(`${item.name} : ${item.count}`);
        }
        return group;
    }
    SortBannedMaps(bannedMaps) {
        let allBannedInformation = [];
        for (const item in bannedMaps) {
            const bannedInformation = new MapInformation(item, bannedMaps[item]);
            allBannedInformation.push(bannedInformation);
        }
        allBannedInformation = allBannedInformation.sort((item1, item2) => item1.count - item2.count);
        return allBannedInformation;
    }
}
exports.SeasonInformationWorker = SeasonInformationWorker;
class MapInformation {
    constructor(name, count) {
        this.name = name;
        this.count = count;
    }
}
//# sourceMappingURL=SeasonInformationWorker.js.map