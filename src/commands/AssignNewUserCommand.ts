import { Client, Guild, GuildMember, PartialGuildMember, Role, TextChannel, User } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSRoles } from "../enums/NGSRoles";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { LiveDataStore } from "../LiveDataStore";
import { AssignNewUserOptions } from "../message-helpers/AssignNewUserOptions";
import { MessageStore } from "../MessageStore";
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

    public async AssignUser(guildMember: GuildMember | PartialGuildMember) : Promise<string> {
        await this.Setup(guildMember);
        const messageOptions = new MessageHelper<AssignNewUserOptions>("NewUsers");
        messageOptions.AddNewLine(`A new userHas joined NGS: **${guildMember.user.username}**`);
        const ngsUser = await DiscordFuzzySearch.GetNGSUser(guildMember.user, await this.dataStore.GetUsers());
        const team = await this.dataStore.LookForRegisteredTeam(ngsUser);
        if (team) {
            messageOptions.Options.FoundTeam = true;
            messageOptions.AddNewLine(`Found new users team: **${team.teamName}**`);
            const rolesResult = await this.AssignValidRoles(team, guildMember, ngsUser);
            messageOptions.Append(rolesResult);
        }
        else {
            messageOptions.AddNewLine(`did not find a team for user.`);
        }
        return messageOptions.CreateStringMessage();
    }

    private async Setup(guildMember: GuildMember | PartialGuildMember) {
        await this.InitializeRoleHelper(guildMember.guild);
        this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles.Captain);
    }

    private async InitializeRoleHelper(guild: Guild) {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        this._serverRoleHelper = new RoleHelper(roles);
    }

    private async AssignValidRoles(team: INGSTeam, guildMember: GuildMember | PartialGuildMember, ngsUser: AugmentedNGSUser) {
        const teamName = team.teamName;
        const teamRoleOnDiscord = await this.FindTeamRole(teamName);
        let result = new MessageHelper<AssignNewUserOptions>(guildMember.displayName);
        if (!teamRoleOnDiscord) {
            return;
        }
        else {
            result.AddNewLine(`Assigned team role`);
            await guildMember.roles.add(teamRoleOnDiscord);
        }

        const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
        const divRoleOnDiscord = roleRsponse.div == NGSRoles.Storm ? null : roleRsponse.role;

        if (divRoleOnDiscord) {
            result.Options.FoundDiv = true;
            result.AddNewLine(`Assigned div role`);
            await guildMember.roles.add(divRoleOnDiscord);
        }

        if (ngsUser.IsCaptain || ngsUser.IsAssistantCaptain) {
            if (this._captainRole) {
                result.AddNewLine(`Assigned Captain role`);
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