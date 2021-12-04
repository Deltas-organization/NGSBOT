import { Client, GuildChannel, GuildMember, Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class CheckReportedGames {
    constructor(private client: Client, private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<string[]> {
        try {
            return await this.GetMessags();
        }
        catch (e) {
            console.log(e);
        }
    }

    private async GetMessags(): Promise<string[]> {
        const gamesInThePast = ScheduleHelper.GetGamesByDaysSorted(await this.dataStore.GetSchedule(), -50);
        const unReportedGames = gamesInThePast;//.filter(g => g.schedule.reported != true);
        //These messages go to the individual captains
        await this.SendMessageFor1DayOldGames(unReportedGames);
        return [await this.CreateUnreportedMessage(unReportedGames)].filter(m => m != null);
        // const gamesTwoDaysOld = unReportedGames.map(g => g.days == 2);
        // const gamesThreeDatsOld = unReportedGames.map(g => g.days == 3);
        // const gamesOlderThenThreeDays = unReportedGames.map(g => g.days > 3);
    }

    private async SendMessageFor1DayOldGames(allUnReportedGames: ScheduleInformation[]) {
        var gamesOneDayOld = allUnReportedGames;//.filter(g => g.days == 1);
        const message = new MessageHelper();
        for (const information of gamesOneDayOld) {
            const schedule = information.schedule;
            const homeCaptains = await this.GetCaptain("death and delay");
            const awayCaptain = await this.GetCaptain("death and delay");
            message.AddNew(`Your game yesterday, **${schedule.home.teamName}** vs **${schedule.away.teamName}** has not been reported.`);
            message.AddNewLine(`If you won the game please report it on the website.`);
            message.AddEmptyLine();
            homeCaptains.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
            awayCaptain.send({
                embed: {
                    color: 0,
                    description: message.CreateStringMessage()
                }
            });
            return;
        }
        return message.CreateStringMessage();
    }

    private async CreateUnreportedMessage(scheduleInformation: ScheduleInformation[]) {
        if (scheduleInformation.length <= 0)
            return null;
        const message = new MessageHelper();
        for (const information of scheduleInformation) {
            const schedule = information.schedule;
            const homeCaptains = await this.GetCaptain(schedule.home.teamName);
            const awayCaptain = await this.GetCaptain(schedule.away.teamName);
            message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
            message.AddNewLine(`Whoever won: ${homeCaptains} or ${awayCaptain}. You must report the match.`);
            message.AddEmptyLine();
        }
        return message.CreateStringMessage();
    }

    private async GetCaptain(teamName: string) {
        const guild = await this.GetGuild(DiscordChannels.NGSDiscord);
        const guildMembers = (await guild.members.fetch()).map((mem, _, __) => mem);

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