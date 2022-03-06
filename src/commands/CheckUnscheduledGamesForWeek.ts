import { Client, Guild, GuildChannel, GuildMember, Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { ClientHelper } from "../helpers/ClientHelper";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class CheckUnscheduledGamesForWeek {
    private guildMembers: GuildMember[];

    constructor(private client: Client, private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<MessageHelper<void>[]> {
        try {
            //this.guildMembers = await ClientHelper.GetMembers(this.client, DiscordChannels.NGSDiscord);
            var result: MessageHelper<void>[] = [];
            for (var value in NGSDivisions) {
                var division = NGSDivisions[value];
                try {
                    result.push(await this.SendMessageForDivision(division));
                }
                catch (e) {
                    Globals.log(`problem reporting matches by round for division: ${division}`, e);
                }
            }
            return result;
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async SendMessageForDivision(division: string): Promise<MessageHelper<void>> {
        var unscheduledGames: INGSSchedule[] = [];

        var divisions = await this.dataStore.GetDivisions();
        const divisionConcat = divisions.filter(d => d.displayName == division)[0].divisionConcat;

        var matches = await this.dataStore.GetScheduleByRoundAndDivision(divisionConcat, 6);
        for (var match of matches) {
            if (!match.scheduledTime) {
                unscheduledGames.push(match);
            }
        }

        var messageToSend = new MessageHelper<void>();
        if (unscheduledGames.length < 1) {
            messageToSend.AddNew(`**${division}** Division has all of their games scheduled for next week!`);
        }
        else {
            messageToSend.AddNew(`Found some unschedule games for Division: **${division}**`);
            for (var unscheduledGame of unscheduledGames) {
                messageToSend.AddNewLine(`**${unscheduledGame.home.teamName}** VS **${unscheduledGame.away.teamName}**`);
            }
        }
        return messageToSend;
    }
}

export class ReportedGamesContainer {
    constructor(public CaptainMessages: string[],
        public ModMessages: string[]) { }
}