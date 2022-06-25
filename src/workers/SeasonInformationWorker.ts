import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { INGSSchedule } from "../interfaces/INGSSchedule";
import { MessageContainer, MessageGroup } from "../message-helpers/MessageContainer";
import { WorkerBase } from "./Bases/WorkerBase";

export class SeasonInformationWorker extends WorkerBase {
    private _season: string;


    constructor(workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        this._season = commands[0];
        var gamesPlayed = await this.dataStore.GetGameInformationForSeason(this._season)
        await this.DisplayBannedMaps(gamesPlayed);
    }

    private async DisplayBannedMaps(gamesPlayed: INGSSchedule[]) {
        const divisionInformation = this.CreateBannedMaps(gamesPlayed);
        const message = new MessageContainer();
        message.AddSimpleGroup(`The banned maps for season ${this._season}:`)
        for (const item in divisionInformation) {
            const sortedMapInformation = this.SortBannedMaps(divisionInformation[item]);
            const messageGroup = this.CreateBannedMapMessage(sortedMapInformation);
            messageGroup.Prepend(`Division: ${item} \n`);
            message.Append(messageGroup);
        }
        await this.messageSender.SendMessageFromContainer(message, true);
    }

    private CreateBannedMaps(gamesPlayed: INGSSchedule[]) {
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

    private CreateBannedMapMessage(allBannedInformation: MapInformation[]) {
        const group = new MessageGroup();
        for (const item of allBannedInformation) {
            group.AddOnNewLine(`${item.name} : ${item.count}`);
        }
        return group;
    }

    private SortBannedMaps(bannedMaps: {}) {
        let allBannedInformation: MapInformation[] = [];
        for (const item in bannedMaps) {
            const bannedInformation = new MapInformation(item, bannedMaps[item]);
            allBannedInformation.push(bannedInformation);
        }
        allBannedInformation = allBannedInformation.sort((item1, item2) => item1.count - item2.count);
        return allBannedInformation;
    }
}

class MapInformation {
    constructor(public name: string, public count: number) {

    }
}
