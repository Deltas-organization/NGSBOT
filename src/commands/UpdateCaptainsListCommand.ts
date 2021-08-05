import { Channel, Client, Guild, GuildChannel, TextChannel } from "discord.js";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { TeamSorter } from "../helpers/TeamSorter";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class UpdateCaptainsListCommand {
    private client: Client;
    private dataStore: DataStoreWrapper;

    constructor(dependencies: CommandDependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }

    public async CreateDivisionList(division: NGSDivisions, channelToUserForGuildRetrieval: string): Promise<string> {
        try {
            const guild = await this.GetGuild(channelToUserForGuildRetrieval);
            const roleHelper = await this.CreateRoleHelper(guild);
            const teams = await this.GetTeamsInDivision(division);
            const divisions = await this.dataStore.GetDivisions();
            const divisionInformation = divisions.find(d => d.displayName == division);
            if (!divisionInformation)
                return `Unable to find division: ${division}`;

            const guildMembers = (await guild.members.fetch()).map((mem, _, __) => mem);
            const modsToLookFor = divisionInformation.moderator.split('&').map(item => item.replace(' ', '').toLowerCase());
            const divMods = guildMembers.filter(member => modsToLookFor.indexOf(DiscordFuzzySearch.GetDiscordId(member.user)) != -1);
            const messageHelper = new MessageHelper<unknown>('captainList');
            messageHelper.AddNewLine(`**${division}** Moderator: ${divMods.join("&")}`);
            for (let team of teams) {
                const teamRole = roleHelper.lookForRole(team.teamName);
                messageHelper.AddNewLine(teamRole?.toString() ?? team.teamName);
                const users = await this.dataStore.GetUsersOnTeam(team);
                let hasAssistant = false;
                for (let user of users.sort((user1, user2) => this.userSort(user1, user2))) {
                    if (user.IsCaptain) {
                        let guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        messageHelper.AddNew(` - captain ${guildMember ?? user.displayName}`)
                    }
                    if (user.IsAssistantCaptain) {
                        let guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        if (hasAssistant) {
                            messageHelper.AddNew(` and ${guildMember ?? user.displayName}`)
                        }
                        else {
                            messageHelper.AddNew(` / ${guildMember ?? user.displayName}`);
                            hasAssistant = true;
                        }
                    }
                }
            }
            messageHelper.AddNewLine(`-----------------------------------`);
            return messageHelper.CreateStringMessage();
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async GetTeamsInDivision(division: NGSDivisions) {
        const teams = await this.dataStore.GetTeams();
        const divisionTeams = teams.filter(team => team.divisionDisplayName == division).sort((t1, t2) => TeamSorter.SortByTeamName(t1, t2));
        return divisionTeams;
    }

    private async CreateRoleHelper(guild: Guild) {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        const roleHelper = new RoleHelper(roles);
        return roleHelper;
    }

    private async GetGuild(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId, false)) as GuildChannel;
        return channel.guild;
    }

    private userSort(user1: AugmentedNGSUser, user2: AugmentedNGSUser) {
        if (user1.IsCaptain)
            return -1;
        if (user2.IsCaptain)
            return 1;
        return 0;
    }
}