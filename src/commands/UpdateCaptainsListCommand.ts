import { Channel, Client, Guild, GuildChannel, TextChannel } from "discord.js";
import { NGSDivisions } from "../enums/NGSDivisions";
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

    public async UpdateDivisionList(division: NGSDivisions, channelId: string)  : Promise<string> {
        const guild = await this.GetGuild(channelId);
        const roleHelper = await this.CreateRoleHelper(guild);
        const teams = await this.GetTeamsInDivision(division);
        const divisionInformaiton = await (await this.dataStore.GetDivisions()).find(d => d.displayName == division);
        const guildMembers = (await guild.members.fetch()).map((mem, _, __) => mem);
        const divMod = guildMembers.find(member => DiscordFuzzySearch.GetDiscordId(member.user) == divisionInformaiton.moderator.toLowerCase());
        const messageHelper = new MessageHelper<unknown>('captainList');
        messageHelper.AddNewLine(`**${division}** Moderator: ${divMod}`);
        for (let team of teams) {
            const teamRole = roleHelper.lookForRole(team.teamName);
            messageHelper.AddNewLine(teamRole.toString());
            const users = await this.dataStore.GetUsersOnTeam(team);
            let hasAssistant = false;
            for (let user of users.sort((user1, user2) => this.userSort(user1, user2))) {
                if (user.IsCaptain)
                {                    
                    let guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers); 
                    messageHelper.AddNew(` - captain ${guildMember ?? user.displayName}`)
                }
                if(user.IsAssistantCaptain)
                {
                    let guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers); 
                    if(hasAssistant)
                    {
                        messageHelper.AddNew(` and ${guildMember ?? user.displayName}`)
                    }
                    else
                    {
                        messageHelper.AddNew(` / ${guildMember ?? user.displayName}`);
                        hasAssistant = true;
                    }
                }
            }
        }
        return messageHelper.CreateStringMessage();
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