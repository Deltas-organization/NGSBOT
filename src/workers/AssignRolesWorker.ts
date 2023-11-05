import { AttachmentBuilder, GuildMember, Role } from "discord.js";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { NGSQueryBuilder } from "../helpers/NGSQueryBuilder";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AssignRolesOptions } from "../message-helpers/AssignRolesOptions";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";
import { Mongohelper } from "../helpers/Mongohelper";
import { NGSMongoHelper } from "../helpers/NGSMongoHelper";

const fs = require('fs');

export class AssignRolesWorker extends RoleWorkerBase {

    private _testing = false;
    private _mutedRole: Role;

    constructor(workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender, private apiKey: string, mongoHelper: NGSMongoHelper) {
        super(workerDependencies, detailed, messageSender, mongoHelper);

    }

    protected async Start(commands: string[]) {
        if (commands.length > 0)
            this._testing = true;

        const mutedRole = this.roleHelper.lookForRole(NGSRoles.Muted);
        if (mutedRole)
            this._mutedRole = mutedRole;
        await this.BeginAssigning();
    }

    private async BeginAssigning() {
        const progressMessages = await this.messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
        const progressMessage = progressMessages[0];
        
        const teams = await this.dataStore.GetTeams();
        await progressMessage.Edit("Loading Discord Members.");
        const messagesLog: MessageHelper<AssignRolesOptions>[] = [];
        try {
            const guildMembers = await this.GetGuildMembers();
            if (!guildMembers)
                return;

            await progressMessage.Edit("Members loaded. \n Assigning Now.");
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
                    await progressMessage.Edit(`Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                    progressCount++;
                }
            }
            fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                updatedTeams: messagesLog.filter(this.FindUpdatedTeams).map(m => m.CreateJsonMessage()),
                nonUpdatedTeams: messagesLog.filter(m => !this.FindUpdatedTeams(m)).map(m => m.CreateJsonMessage())
            }));

            var attachment = new AttachmentBuilder('./files/assignedRoles.json');
            attachment.name = 'AssignRolesReport.json';
            await this.messageSender.SendFiles([attachment]).catch(console.error);
        }
        catch (e) {
            Globals.log(e);
        }

        const messageHelper = new MessageHelper<any>("Success");
        messageHelper.AddNewLine("Finished Assigning Roles!");
        const teamRolesCreated = messagesLog.filter(m => m.Options.CreatedTeamRole).length;
        if (teamRolesCreated)
            messageHelper.AddNewLine(`Created ${teamRolesCreated} Team Roles`);

        messageHelper.AddNewLine(`Assigned ${messagesLog.filter(m => m.Options.AssignedTeamCount != null).map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} Team Roles`);
        messageHelper.AddNewLine(`Assigned ${messagesLog.filter(m => m.Options.AssignedTeamCount != null).map(m => m.Options.AssignedDivCount).reduce((m1, m2) => m1 + m2, 0)} Div Roles`);
        messageHelper.AddNewLine(`Assigned ${messagesLog.filter(m => m.Options.AssignedTeamCount != null).map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles `);
        const teamsWithNoValidCaptain: string[] = [];
        const teamsWithLessThen3People: string[] = [];
        for (var message of messagesLog) {
            if (!message.Options.HasCaptain) {
                teamsWithNoValidCaptain.push(message.Options.TeamName);
            }
            if (message.Options.PlayersInDiscord < 3) {
                teamsWithLessThen3People.push(message.Options.TeamName);
            }
        }
        if (teamsWithNoValidCaptain.length > 0)
            messageHelper.AddNewLine(`**Teams with no Assignable Captains**: ${teamsWithNoValidCaptain.join(', ')}`);
        else
            messageHelper.AddNewLine(`All teams Have a valid Captain! woot.`);

        if (teamsWithLessThen3People.length > 0)
            messageHelper.AddNewLine(`**Teams without 3 people registered**: ${teamsWithLessThen3People.join(', ')}`);
        else
            messageHelper.AddNewLine(`All teams Have 3 people registed on the website and present in the discord!!!`);

        await this.messageSender.SendMessage(messageHelper.CreateStringMessage());
        await progressMessage.Delete();
    }

    private FindUpdatedTeams(message: MessageHelper<AssignRolesOptions>) {
        const options = message.Options;
        if (options.AssignedCaptainCount > 0)
            return true;
        if (options.AssignedDivCount > 0)
            return true;
        if (options.AssignedTeamCount > 0)
            return true;
        return false;
    }

    private async AssignValidRoles(team: INGSTeam, guildMembers: GuildMember[]) {
        const teamName = team.teamName;
        let messageTracker = new MessageHelper<AssignRolesOptions>(team.teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageTracker, teamName);
        try {
            let divRoleOnDiscord: Role | null = null;
            if (team.divisionDisplayName) {
                const roleResponse = this.roleHelper.FindDivRole(team.divisionDisplayName);
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

        let teamRoleOnDiscord = this.roleHelper.lookForRole(teamName);
        if (!teamRoleOnDiscord && this.messageSender.originalMessage.guild) {
            teamRoleOnDiscord = await this.messageSender.originalMessage.guild.roles.create({
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
        const teamUsers = await this.dataStore.GetUsersOnTeam(teamName);

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
                if (this.HasRole(rolesOfUser, this._mutedRole)) {
                    messageTracker.AddJSONLine('Didnt add roles as the person is muted')
                    continue;
                }
                messageTracker.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                messageTracker.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                if (teamRole != null && !this.HasRole(rolesOfUser, teamRole)) {
                    await this.AssignRole(guildMember, teamRole);
                    messageTracker.Options.AssignedTeamCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${teamRole?.name}`);
                }
                if (divRole != null && !this.HasRole(rolesOfUser, divRole)) {
                    await this.AssignRole(guildMember, divRole);
                    messageTracker.Options.AssignedDivCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${divRole?.name}`);
                }

                if (user.IsCaptain || user.IsAssistantCaptain) {
                    if (this.captainRole && !this.HasRole(rolesOfUser, this.captainRole)) {
                        await this.AssignRole(guildMember, this.captainRole);
                        messageTracker.Options.AssignedCaptainCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${this.captainRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${this.captainRole.name}`);
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
                apiKey: this.apiKey,
                discordId: member.id
            });
            Globals.log(`saved discord id for user: ${user.displayName}`)
        }
        catch (e) {
            Globals.log(e);
            Globals.log(`Unable to save discord id for user: ${user.displayName}`);
        }
    }

    private async AssignRole(guildMember: GuildMember, roleToAssign: Role) {
        if (!this._testing)
            await guildMember.roles.add(roleToAssign);
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}