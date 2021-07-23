import { Guild, GuildMember, Role } from "discord.js";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { INGSTeam } from "../interfaces";
import { AssignRolesOptions } from "../message-helpers/AssignRolesOptions";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";
import { WorkerBase } from "./Bases/WorkerBase";

const fs = require('fs');

export class AssignRolesWorker extends RoleWorkerBase {

    private _testing = false;

    protected async Start(commands: string[]) {
        if (commands.length > 0)
            this._testing = true;

        await this.BeginAssigning();
    }

    private async BeginAssigning() {
        const progressMessage = await this.messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
        const teams = await this.dataStore.GetTeams();
        await this.messageSender.Edit(progressMessage, "Loading Discord Members.");
        const messagesLog: MessageHelper<AssignRolesOptions>[] = [];
        try {
            const guildMembers = (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            await this.messageSender.Edit(progressMessage, "Members loaded. \n Assigning Now.");
            let count = 0;
            let progressCount = 1;
            let steps = 10;
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                count++;
                let messageHelper = await this.AssignValidRoles(team, guildMembers);
                if (messageHelper) {
                    messagesLog.push(messageHelper);
                }
                if (count > (teams.length / steps) * progressCount) {
                    await this.messageSender.Edit(progressMessage, `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                    progressCount++;
                }
            }
            fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                detailedInformation: messagesLog.map(message => message.CreateJsonMessage())
            }));
            await this.messageSender.TextChannel.send({
                files: [{
                    attachment: './files/assignedRoles.json',
                    name: 'AssignRolesReport.json'
                }]
            }).catch(console.error);
        }
        catch (e) {
            Globals.log(e);
        }

        const messageHelper = new MessageHelper<any>("Success");
        messageHelper.AddNewLine("Finished Assigning Roles!");
        const teamRolesCreated = messagesLog.filter(m => m.Options.CreatedTeamRole).length;
        if (teamRolesCreated)
            messageHelper.AddNewLine(`Created ${teamRolesCreated} Team Roles`);

        messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} Team Roles`);
        messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedDivCount).reduce((m1, m2) => m1 + m2, 0)} Div Roles`);
        messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles `);
        const teamsWithNoValidCaptain = [];
        const teamsWithLessThen3People = [];
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
        await progressMessage.delete();
    }

    private async AssignValidRoles(team: INGSTeam, guildMembers: GuildMember[]) {
        const teamName = team.teamName;
        let result = new MessageHelper<AssignRolesOptions>(team.teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(result, teamName);
        try {
            if(team.divisionDisplayName)
            {
                const roleResponse = this.roleHelper.FindDivRole(team.divisionDisplayName);
                var divRoleOnDiscord = roleResponse.div == NGSRoles.Storm ? null : roleResponse.role;
            }
            await this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
        }
        catch (e) {
            result.AddNewLine(`There was a problem assigning team: ${teamName}`);
            result.AddJSONLine(e);
        }
        return result;
    }

    private async CreateOrFindTeamRole(messageTracker: MessageHelper<AssignRolesOptions>, teamName: string) {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this.roleHelper.lookForRole(teamName);
        if (!teamRoleOnDiscord) {
            teamRoleOnDiscord = await this.messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
                    mentionable: true,
                    hoist: true
                },
                reason: 'needed a new team role added'
            });

            messageTracker.Options.CreatedTeamRole = true;
        }

        return teamRoleOnDiscord;
    }

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], messageTracker: MessageHelper<AssignRolesOptions>, teamRole: Role, divRole: Role): Promise<MessageHelper<AssignRolesOptions>> {
        const teamName = team.teamName;
        const teamUsers = await this.dataStore.GetUsersOnTeam(teamName);

        messageTracker.Options = new AssignRolesOptions(teamName);
        messageTracker.AddNewLine("**Team Name**");;
        messageTracker.AddNewLine(teamName);
        messageTracker.AddNewLine("**Users**");
        for (let user of teamUsers) {
            const guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
            messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (guildMember) {
                messageTracker.Options.PlayersInDiscord++;
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
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

    private async AssignRole(guildMember: GuildMember, divRole: Role) {
        if (!this._testing)
            await guildMember.roles.add(divRole);
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}