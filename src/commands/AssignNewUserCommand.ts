import { Client, GuildMember, PartialGuildMember, Role } from "discord.js";
import { DiscordGuilds } from "../enums/DiscordGuilds";
import { NGSRoles } from "../enums/NGSRoles";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { RoleHelper } from "../helpers/RoleHelper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam } from "../interfaces";
import { MessageGroup } from "../message-helpers/MessageContainer";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class AssignNewUserCommand {
    private client: Client;
    private dataStore: DataStoreWrapper;

    private _captainRole: Role;
    private _serverRoleHelper: RoleHelper;

    constructor(dependencies: CommandDependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }

    public async AssignUser(guildMember: GuildMember | PartialGuildMember): Promise<{ MessageGroup: MessageGroup, FoundTeam: boolean }> {
        await this.Setup(guildMember);
        const messageGroup = new MessageGroup();
        if (guildMember.guild.id != DiscordGuilds.NGS)
            return null;

        messageGroup.AddOnNewLine(`A new userHas joined NGS: **${guildMember.user.username}**`);
        const ngsUser = await DiscordFuzzySearch.GetNGSUser(guildMember.user, await this.dataStore.GetUsers());
        var foundTeam = false;
        if (ngsUser) {
            const team = await this.dataStore.LookForRegisteredTeam(ngsUser);
            if (team) {
                foundTeam = true;
                messageGroup.AddOnNewLine(`Found new users team: **${team.teamName}**`);
                const rolesResult = await this.AssignValidRoles(team, guildMember, ngsUser);
                messageGroup.Combine(rolesResult);
            }
            else {
                messageGroup.AddOnNewLine(`did not find a team for user.`);
            }
        }
        return { MessageGroup: messageGroup, FoundTeam: foundTeam };
    }

    private async Setup(guildMember: GuildMember | PartialGuildMember) {
        this._serverRoleHelper = await RoleHelper.CreateFrom(guildMember.guild);
        this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles.Captain);
    }

    private async AssignValidRoles(team: INGSTeam, guildMember: GuildMember | PartialGuildMember, ngsUser: AugmentedNGSUser): Promise<MessageGroup> {
        const teamName = team.teamName;
        const teamRoleOnDiscord = await this.FindTeamRole(teamName);
        let result = new MessageGroup();
        if (!teamRoleOnDiscord) {
            return;
        }
        else {
            result.AddOnNewLine(`Assigned team role`);
            await guildMember.roles.add(teamRoleOnDiscord);
        }

        const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
        let divRoleOnDiscord = roleRsponse.div == NGSRoles.Storm ? null : roleRsponse.role;
        divRoleOnDiscord = null;
        if (divRoleOnDiscord) {
            result.AddOnNewLine(`Assigned div role`);
            await guildMember.roles.add(divRoleOnDiscord);
        }
        else {
            result.AddOnNewLine(`Didn't assign div role since season hasn't started`);
        }

        if (ngsUser.IsCaptain || ngsUser.IsAssistantCaptain) {
            if (this._captainRole) {
                result.AddOnNewLine(`Assigned Captain role`);
                await guildMember.roles.add(this._captainRole);
            }
        }

        return result;
    }

    private async FindTeamRole(teamName: string) {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this._serverRoleHelper.lookForRole(teamName);
        if (teamRoleOnDiscord) {
            return teamRoleOnDiscord;
        }

        return null;
    }
}