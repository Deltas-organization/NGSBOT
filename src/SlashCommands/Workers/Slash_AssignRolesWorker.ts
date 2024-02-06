import { CacheType, Client, CommandInteraction, Guild, GuildChannel, GuildMember, Message, Role, User } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { NGSDivisions } from "../../enums/NGSDivisions";
import { Globals } from "../../Globals";
import { ChannelHelper } from "../../helpers/ChannelHelper";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../../helpers/MessageHelper";
import { ChannelMessageSender } from "../../helpers/messageSenders/ChannelMessageSender";
import { Mongohelper } from "../../helpers/Mongohelper";
import { RoleHelper } from "../../helpers/RoleHelper";
import { ScheduleHelper } from "../../helpers/ScheduleHelper";
import { INGSTeam, INGSUser } from "../../interfaces";
import { LiveDataStore } from "../../LiveDataStore";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { AugmentedNGSUser } from "../../models/AugmentedNGSUser";
import { CaptainList } from "../../mongo/models/captain-list";
import { NGSMongoHelper } from "../../helpers/NGSMongoHelper";
import { NGSRoles } from "../../enums/NGSRoles";
import { WorkerHelper } from "./Helpers/WorkerHelper";
import { AssignRolesOptions } from "../../message-helpers/AssignRolesOptions";
import { NGSQueryBuilder } from "../../helpers/NGSQueryBuilder";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";

export class SlashAssignRolesWorker {

    private _roleHelper: RoleHelper;
    private _mutedRole: Role;
    private _workerhelper: WorkerHelper;
    private _captainRole: Role;

    public constructor(private _dependencies:  CommandDependencies, private _interaction: CommandInteraction<CacheType>) {
        this._workerhelper = new WorkerHelper(_dependencies.client, DiscordChannels.NGSDiscord);
    }

    public async Run(): Promise<void> {
        this._roleHelper = await RoleHelper.CreateFrom(await this._workerhelper.Guild);
        const mutedRole = this._roleHelper.lookForRole(NGSRoles.Muted);
        if (mutedRole)
            this._mutedRole = mutedRole;

        var captainRole = this._roleHelper.lookForRole(NGSRoles.Captain);
        if (captainRole)
            this._captainRole = captainRole;

        await this._interaction.editReply({
            content: "Beginning Assignments \n  Loading teams now."
        });

        const teams = await this._dependencies.dataStore.GetTeams();
        await this._interaction.editReply({
            content: "Loading Discord Members"
        });

        const guildMembers = await this._workerhelper.GetGuildMembers();
        if (!guildMembers) {
            await this._interaction.editReply({
                content: "Loading members failed."
            });
            return;
        }

        await this._interaction.editReply({
            content: "Members loaded. \n Assigning Now."
        });

        const messagesLog: MessageHelper<AssignRolesOptions>[] = [];

        let count = 0;
        let progressCount = 1;
        let steps = 10;
        for (var team of teams.GetTeamsSortedByTeamNames()) {
            count++;
            let messageHelper = await this.AssignValidRoles(team, guildMembers);
            if (messageHelper) {
                messagesLog.push(messageHelper);
            }
            if (count > (teams.length / steps) * progressCount) {
                await this._interaction.editReply({
                    content: `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`
                });
                progressCount++;
            }
        }
    }

    private async AssignValidRoles(team: INGSTeam, guildMembers: GuildMember[]) {
        const teamName = team.teamName;
        let messageTracker = new MessageHelper<AssignRolesOptions>(team.teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageTracker, teamName);
        try {
            let divRoleOnDiscord: Role | null = null;
            if (team.divisionDisplayName) {
                const roleResponse = this._roleHelper.FindDivRole(team.divisionDisplayName);
                divRoleOnDiscord = roleResponse.role;
            }
            await this.AssignUsersToRoles(team, guildMembers, messageTracker, teamRoleOnDiscord, divRoleOnDiscord);
        }
        catch (e) {
            messageTracker.AddNewLine(`There was a problem assigning team: ${teamName}`);
            Globals.log(e);
            messageTracker.AddJSONLine(e);
        }
        return messageTracker;
    }

    private async CreateOrFindTeamRole(messageTracker: MessageHelper<AssignRolesOptions>, teamName: string) {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this._roleHelper.lookForRole(teamName);
        if (!teamRoleOnDiscord) {
            teamRoleOnDiscord = await (await this._workerhelper.Guild).roles.create({
                name: teamName,
                mentionable: true,
                hoist: true,
                reason: 'needed a new team role added'
            });

            messageTracker.Options.CreatedTeamRole = true;
        }

        return teamRoleOnDiscord;
    }

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], messageTracker: MessageHelper<AssignRolesOptions>, teamRole: Role | null, divRole: Role | null): Promise<MessageHelper<AssignRolesOptions>> {
        const teamName = team.teamName;
        const teamUsers = await this._dependencies.dataStore.GetUsersOnTeam(teamName);

        messageTracker.Options = new AssignRolesOptions(teamName);
        messageTracker.AddNewLine("**Team Name**");;
        messageTracker.AddNewLine(teamName);
        messageTracker.AddNewLine("**Users**");

        for (let user of teamUsers) {
            var searchResult = await DiscordFuzzySearch.FindGuildMember(user, guildMembers);
            messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (searchResult) {
                const guildMember = searchResult.member;
                if (searchResult.updateDiscordId)
                    await this.UpdateDiscordID(user, guildMember);
                messageTracker.Options.PlayersInDiscord++;
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                if (this._workerhelper.HasRole(rolesOfUser, this._mutedRole)) {
                    messageTracker.AddJSONLine('Didnt add roles as the person is muted')
                    continue;
                }
                messageTracker.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                messageTracker.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                if (teamRole != null && !this._workerhelper.HasRole(rolesOfUser, teamRole)) {
                    await this._workerhelper.AssignRole(guildMember, teamRole);
                    messageTracker.Options.AssignedTeamCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${teamRole?.name}`);
                }
                if (divRole != null && !this._workerhelper.HasRole(rolesOfUser, divRole)) {
                    await this._workerhelper.AssignRole(guildMember, divRole);
                    messageTracker.Options.AssignedDivCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${divRole?.name}`);
                }

                if (user.IsCaptain || user.IsAssistantCaptain) {
                    if (this._captainRole && !this._workerhelper.HasRole(rolesOfUser, this._captainRole)) {
                        await this._workerhelper.AssignRole(guildMember, this._captainRole);
                        messageTracker.Options.AssignedCaptainCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                    }
                    if (user.IsCaptain)
                        messageTracker.Options.HasCaptain = true;
                }
            }
            else {
                messageTracker.AddNewLine(`**No Matching DiscordId Found**`, 4);
            }
        }

        return messageTracker;
    }
    
    private async UpdateDiscordID(user: INGSUser, member: GuildMember): Promise<void> {
        try {
            await new NGSQueryBuilder().PostResponse('user/save/discordid', {
                displayName: user.displayName,
                apiKey: this._dependencies.apiKey,
                discordId: member.id
            });
            Globals.log(`saved discord id for user: ${user.displayName}`)
        }
        catch (e) {
            Globals.log(e);
            Globals.log(`Unable to save discord id for user: ${user.displayName}`);
        }
    }
}