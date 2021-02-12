import { Client, Guild, GuildMember, MessageAttachment, Role, TextChannel, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { debug } from "console";
import { TeamNameChecker } from "./TeamChecker";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { MessageHelper } from "../helpers/MessageHelper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { NGSRoles } from "../enums/NGSRoles";

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase {
    private _testing = false;
    private _serverRoles: Role[];
    private _stopIteration = false;

    private readonly _captainRoleName = 'Captains';
    private _captainRole: Role;

    public get commandBangs(): string[] {
        return ["assign"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        if (commands.length > 0)
            this._testing = true;
        this._stopIteration = false;
        this.liveDataStore.Clear();
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        const progressMessage = await messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
        const teams = await this.liveDataStore.GetTeams();
        await messageSender.Edit(progressMessage, "Teams Loaded. \n Assigning Now.");
        const rolesAdded = [];
        const messagesLog: MessageHelper<MessageOptions>[] = [];
        try {
            const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            let count = 0;
            let progressCount = 1;
            let steps = 10;
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                count++;
                let messageHelper = await this.AssignValidRoles(messageSender, team, guildMembers, rolesAdded);
                if (messageHelper) {
                    messagesLog.push(messageHelper);
                    if (detailed) {
                        if (!messageHelper.Options.HasValue) {
                            await messageSender.SendMessage(messageHelper.CreateStringMessage());
                        }
                    }
                }
                if (count > (teams.length / steps) * progressCount) {
                    await messageSender.Edit(progressMessage, `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                    progressCount++;
                }
                if (this._stopIteration)
                    break;
            }
            if (!detailed) {
                fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                    AddedRoles: rolesAdded,
                    discordIds: guildMembers.map(guildMember => DiscordFuzzySearch.GetDiscordId(guildMember.user) + " : " + guildMember.id),
                    detailedInformation: messagesLog.map(message => message.CreateJsonMessage())
                }));
                await messageSender.TextChannel.send({
                    files: [{
                        attachment: './files/assignedRoles.json',
                        name: 'AssignRolesReport.json'
                    }]
                }).catch(console.error);
            }
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
        for (var message of messagesLog) {
            if (!message.Options.HasCaptain) {
                teamsWithNoValidCaptain.push(message.Options.TeamName);
            }
        }
        if (teamsWithNoValidCaptain.length > 0)
            messageHelper.AddNewLine(`Teams with no Assignable Captains: ${teamsWithNoValidCaptain.join(', ')}`);
        else
            messageHelper.AddNewLine(`All teams Have a valid Captain`);

        await messageSender.SendMessage(messageHelper.CreateStringMessage());
        await progressMessage.delete();
    }

    private ReloadServerRoles(guild: Guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async AssignValidRoles(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[], rolesAdded: string[]) {
        const teamName = team.teamName;
        let result = new MessageHelper<MessageOptions>(team.teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageSender, result, teamName, rolesAdded);
        const divRoleOnDiscord = this.FindDivRole(team.divisionDisplayName);

        await this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
        return result;
    }

    private async CreateOrFindTeamRole(messageSender: MessageSender, messageTracker: MessageHelper<MessageOptions>, teamName: string, rolesAdded: string[]) {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName)
        if (!teamRoleOnDiscord) {
            rolesAdded.push(teamName);
            teamRoleOnDiscord = await messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
                    mentionable: true,
                    hoist: true
                },
                reason: 'needed a new team role added'
            });

            messageTracker.Options.CreatedTeamRole = true;
        }

        return teamRoleOnDiscord
    }

    private FindDivRole(divisionDisplayName: string) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
                divRoleName = NGSRoles.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = NGSRoles.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSRoles.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = NGSRoles.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = NGSRoles.DivE;
                break;
            case "nexus":
                divRoleName = NGSRoles.Nexus;
                break;
            case "heroic":
                divRoleName = NGSRoles.Heroic;
                break;
            case "storm":
                return null;
        }
        return this.lookForRole(this._serverRoles, divRoleName);
    }

    private lookForRole(userRoles: Role[], roleName: string): Role {
        let roleNameTrimmed = roleName.trim().toLowerCase();

        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], messageTracker: MessageHelper<MessageOptions>, teamRole: Role, divRole: Role): Promise<MessageHelper<MessageOptions>> {
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == team.teamName);

        messageTracker.Options = new MessageOptions(team.teamName);
        messageTracker.AddNewLine("**Team Name**");;
        messageTracker.AddNewLine(team.teamName);
        messageTracker.AddNewLine("**Users**");
        for (let user of teamUsers) {
            const guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
            messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (guildMember) {
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
                    if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole)) {
                        await this.AssignRole(guildMember, this._captainRole);
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

    private async AssignRole(guildMember: GuildMember, divRole: Role) {
        await guildMember.roles.add(divRole);
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        if (!this._testing)
            return rolesOfUser.find(role => role == roleToLookFor);
    }

}


class MessageOptions {
    public AssignedTeamCount: number = 0;
    public AssignedDivCount: number = 0;
    public AssignedCaptainCount: number = 0;
    public HasCaptain: boolean;
    public CreatedTeamRole: boolean;

    constructor(public TeamName: string) {

    }

    public get HasValue() {
        if (this.AssignedCaptainCount > 0)
            return true;
        if (this.AssignedDivCount > 0)
            return true;
        if (this.AssignedCaptainCount > 0)
            return true;
        return false;
    }
}
