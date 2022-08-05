import { Client, GuildMember } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { ClientHelper } from "../helpers/ClientHelper";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";

export class CheckReportedGames {
    private guildMembers: GuildMember[];

    constructor(private client: Client, private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<ReportedGamesContainer> {
        try {
            this.guildMembers = await ClientHelper.GetMembers(this.client, DiscordChannels.NGSDiscord);
            return await this.GetMessages();
        }
        catch (e) {
            console.log(e);
        }
    }

    private async GetMessages(): Promise<ReportedGamesContainer> {
        const gamesInThePast = ScheduleHelper.GetGamesByDaysSorted(await this.dataStore.GetScheduledGames(), -10);
        const unReportedGames = gamesInThePast.filter(g => g.schedule.reported != true);
        //These messages go to the individual captains
        await this.SendMessageFor1DayOldGames(unReportedGames);
        var captainMessages: string[] = [];
        captainMessages.push(...(await this.CreateMessageFor2DayOldGames(unReportedGames)));
        captainMessages.push(...(await this.CreateMessageFor3DayOldGames(unReportedGames)));
        var modMessages: string[] = [];
        modMessages.push(...(await this.CreateMessageForOlderGames(unReportedGames)));
        return new ReportedGamesContainer(captainMessages.filter(m => m != null), modMessages.filter(m => m != null));
    }

    private async SendMessageFor1DayOldGames(allUnReportedGames: ScheduleInformation[]) {
        var gamesOneDayOld = allUnReportedGames.filter(g => g.days == 0);
        if (gamesOneDayOld.length <= 0)
            return null;

        for (const information of gamesOneDayOld) {
            const message = new MessageHelper();
            const schedule = information.schedule;
            const homeCaptains = await this.GetCaptain(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            message.AddNew(`Your game yesterday, **${schedule.home.teamName}** vs **${schedule.away.teamName}** has not been reported.`);
            message.AddNewLine(`If you won the game please report it on the website.`);
            message.AddEmptyLine();
            await homeCaptains.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
            await awayCaptain.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
        }
    }

    private async CreateMessageFor2DayOldGames(allUnReportedGames: ScheduleInformation[]): Promise<string[]> {
        var gamesTwoDaysOld = allUnReportedGames.filter(g => g.days == 1);
        if (gamesTwoDaysOld.length <= 0)
            return [];

        var messages: MessageHelper<void>[] = [];
        for (const information of gamesTwoDaysOld) {
            const message = new MessageHelper<void>();
            const schedule = information.schedule;
            const homeCaptain = await this.GetCaptain(schedule.home.teamName);
            const homeACs = await this.GetAssistantCaptains(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            const awayAcs = await this.GetAssistantCaptains(schedule.away.teamName);
            message.AddNew(`A game has not been reported for 2 days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`Whoever won, You must report the match.`);
            message.AddNewLine(`${schedule.home.teamName}: ${homeCaptain}`);
            homeACs.forEach(ac => {
                message.AddNew(` ${ac} `);
            })
            message.AddNewLine(`${schedule.away.teamName}:  ${awayCaptain}`);
            awayAcs.forEach(ac => {
                message.AddNew(` ${ac} `);
            })
            messages.push(message);
        }
        return messages.map(messages => messages.CreateStringMessage());
    }

    private async CreateMessageFor3DayOldGames(allUnReportedGames: ScheduleInformation[]): Promise<string[]> {
        var gamesThreeDaysOld = allUnReportedGames.filter(g => g.days == 2);
        if (gamesThreeDaysOld.length <= 0)
            return [];

        var messages: MessageHelper<void>[] = [];
        for (const information of gamesThreeDaysOld) {
            const message = new MessageHelper<void>();
            const schedule = information.schedule;
            const homeCaptain = await this.GetCaptain(schedule.home.teamName);
            const homeACs = await this.GetAssistantCaptains(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            const awayAcs = await this.GetAssistantCaptains(schedule.away.teamName);
            message.AddNew(`A game has not been reported for 3 days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`Whoever won, You must report the match, or the winning team will be penalized.`);
            message.AddNewLine(`${schedule.home.teamName}: ${homeCaptain}`);
            homeACs.forEach(ac => {
                message.AddNew(` ${ac} `);
            });
            message.AddNewLine(`${schedule.away.teamName}: ${awayCaptain}`);
            awayAcs.forEach(ac => {
                message.AddNew(` ${ac} `);
            });
            const divMods = await this.GetDivMods(schedule.divisionDisplayName);
            message.AddNewLine('MOD: ');
            divMods.forEach(divMod => {
                message.AddNew(` ${divMod} `);
            });
            messages.push(message);
        }
        return messages.map(messages => messages.CreateStringMessage());
    }

    private async CreateMessageForOlderGames(allUnReportedGames: ScheduleInformation[]): Promise<string[]> {
        var gamesTooOld = allUnReportedGames.filter(g => g.days > 2);
        if (gamesTooOld.length <= 0)
            return [];

        var messages: MessageHelper<void>[] = [];
        for (const information of gamesTooOld) {
            const message = new MessageHelper<void>();
            const schedule = information.schedule;
            message.AddNew(`This game has not been reported for ${information.days + 1} days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`The Division is: ${schedule.divisionDisplayName}`);
            messages.push(message);
        }
        return messages.map(messages => messages.CreateStringMessage());
    }

    private async GetCaptain(teamName: string): Promise<GuildMember> {
        var teamHelper = await this.dataStore.GetTeams();
        const teamMembers = await teamHelper.FindUsersOnTeam(teamName);
        const captains = teamMembers.filter(mem => mem.IsCaptain);
        for (var captain of captains) {
            const guildMember = await DiscordFuzzySearch.FindGuildMember(captain, this.guildMembers);
            if (guildMember)
                return guildMember.member;
        }
    }

    private async GetAssistantCaptains(teamName: string): Promise<GuildMember[]> {
        var teamHelper = await this.dataStore.GetTeams();
        const teamMembers = await teamHelper.FindUsersOnTeam(teamName);
        const captains = teamMembers.filter(mem => mem.IsAssistantCaptain);
        const result: GuildMember[] = [];
        for (var captain of captains) {
            const guildMember = await DiscordFuzzySearch.FindGuildMember(captain, this.guildMembers)
            if (guildMember)
                result.push(guildMember.member)
        }
        return result;
    }

    private async GetDivMods(division: any): Promise<GuildMember[]> {
        const divisions = await this.dataStore.GetDivisions();
        const divisionInformation = divisions.find(d => d.displayName == division);
        if (!divisionInformation)
            return [];

        const modsToLookFor = divisionInformation.moderator.split('&').map(item => item.replace(' ', '').toLowerCase());
        const divMods = this.guildMembers.filter(member => modsToLookFor.indexOf(DiscordFuzzySearch.GetDiscordId(member.user)) != -1);
        return divMods;
    }
}

export class ReportedGamesContainer {
    constructor(public CaptainMessages: string[],
        public ModMessages: string[]) { }
}