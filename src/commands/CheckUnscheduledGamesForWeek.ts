import { Client, Guild, GuildChannel, GuildMember, Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { ClientHelper } from "../helpers/ClientHelper";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { Mongohelper } from "../helpers/Mongohelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class CheckUnscheduledGamesForWeek {

    constructor(private mongoHelper: Mongohelper, private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<MessageHelper<void>[]> {
        try {
            var information = await this.mongoHelper.GetNgsInformation(13);
            var result: MessageHelper<void>[] = [];
            for (var value in NGSDivisions) {
                var division = NGSDivisions[value];
                try {
                    //We do +1 since the round hasn't been incremented yet and we are looking at next weeks scheduled games.
                    result.push(await this.SendMessageForDivision(division, information.round + 1));
                }
                catch (e) {
                    Globals.log(`problem reporting matches by round for division: ${division}`, e);
                }
            }
            // await this.mongoHelper.UpdateSeasonRound(13);
            return result;
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async SendMessageForDivision(division: string, roundNumber: number): Promise<MessageHelper<void>> {
        var unscheduledGames: INGSSchedule[] = [];

        var divisions = await this.dataStore.GetDivisions();
        const divisionConcat = divisions.filter(d => d.displayName == division)[0].divisionConcat;

        var matches = await this.dataStore.GetScheduleByRoundAndDivision(divisionConcat, roundNumber);
        for (var match of matches) {
            if (match.scheduledTime || match.reported || match.forfeit)
                continue;

            unscheduledGames.push(match);

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