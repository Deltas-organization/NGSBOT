import { Client, Guild, GuildChannel, GuildMember, Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { ClientHelper } from "../helpers/ClientHelper";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class CheckReportedGames {
    constructor(private client: Client, private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<string[]> {
        try {
            const guild = await this.GetGuild(DiscordChannels.NGSDiscord);
            return await this.GetMessags();
        }
        catch (e) {
            console.log(e);
        }
    }

    private async GetMessags(): Promise<string[]> {
        const gamesInThePast = ScheduleHelper.GetGamesByDaysSorted(await this.dataStore.GetSchedule(), -50);
        const unReportedGames = gamesInThePast.filter(g => g.schedule.reported != true);
        //These messages go to the individual captains
        await this.SendMessageFor1DayOldGames(unReportedGames);
        var messagesToSendToChannel: string[] = [];
        messagesToSendToChannel.push(await this.CreateUnreportedCaptainMessage(unReportedGames));
        messagesToSendToChannel.push(await this.CreateUnreportedTeamMessage(unReportedGames));
        return messagesToSendToChannel.filter(m => m != null);
    }

    private async SendMessageFor1DayOldGames(allUnReportedGames: ScheduleInformation[]) {
        var gamesOneDayOld = allUnReportedGames.filter(g => g.days == 1);
        const message = new MessageHelper();
        for (const information of gamesOneDayOld) {
            const schedule = information.schedule;
            const homeCaptains = await this.GetCaptain(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            message.AddNew(`Your game yesterday, **${schedule.home.teamName}** vs **${schedule.away.teamName}** has not been reported.`);
            message.AddNewLine(`If you won the game please report it on the website.`);
            message.AddEmptyLine();
            homeCaptains.member.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
            awayCaptain.member.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
            return;
        }
        return message.CreateStringMessage();
    }

    private async CreateUnreportedCaptainMessage(allUnReportedGames: ScheduleInformation[]) {
        var gamesTwoDaysOld = allUnReportedGames.filter(g => g.days == 2);
        if (gamesTwoDaysOld.length <= 0)
            return null;
        const message = new MessageHelper();
        for (const information of gamesTwoDaysOld) {
            const schedule = information.schedule;
            const homeCaptain = await this.GetCaptain(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`Whoever won: ${homeCaptain} or ${awayCaptain}. You must report the match.`);
            message.AddEmptyLine();
        }
        return message.CreateStringMessage();
    }

    private async CreateUnreportedTeamMessage(allUnReportedGames: ScheduleInformation[]) {
        var gamesolderThen2Days = allUnReportedGames.filter(g => g.days >= 3);
        if (gamesolderThen2Days.length <= 0)
            return null;

        var roleHelper = await RoleHelper.CreateFromclient(this.client, DiscordChannels.NGSDiscord);
        const message = new MessageHelper();
        for (const information of gamesolderThen2Days) {
            const schedule = information.schedule;
            const team1Role = roleHelper.lookForRole(schedule.home.teamName);
            const team2Role = roleHelper.lookForRole(schedule.away.teamName);
            message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`Whoever won: ${team1Role} or ${team2Role}. You must report the match or it will be forfeit.`);
            message.AddEmptyLine();
        }
        return message.CreateStringMessage();
    }

    private async GetCaptain(teamName: string) {
        const guildMembers = await ClientHelper.GetMembers(this.client, DiscordChannels.NGSDiscord);

        const teamMembers = await this.GetTeamMembers(teamName);
        const captains = teamMembers.filter(mem => mem.IsCaptain);
        for (var captain of captains) {
            const guildMember = DiscordFuzzySearch.FindGuildMember(captain, guildMembers)
            return guildMember;
        }
    }

    private async GetTeamMembers(teamName: string) {
        const result: AugmentedNGSUser[] = [];
        const teams = await this.dataStore.GetTeams();
        for (let team of teams) {
            if (teamName == team.teamName) {
                const users = await this.dataStore.GetUsersOnTeam(team);
                for (var user of users) {
                    result.push(user);
                }
            }
        }
        return result;
    }


    private async GetGuild(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId, false)) as GuildChannel;
        return channel.guild;
    }
}