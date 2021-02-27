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
import { RoleHelper } from "../helpers/RoleHelper";
import { convertCompilerOptionsFromJson } from "typescript";

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase
{
    private _testing = false;

    private _captainRole: Role;
    private _serverRoleHelper: RoleHelper;

    public get commandBangs(): string[]
    {
        return ["assign"];
    }

    public get description(): string
    {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        if (commands.length > 0)
            this._testing = true;

        await this.Setup(messageSender);
        await this.BeginAssigning(messageSender, detailed);
    }

    private async Setup(messageSender: MessageSender)
    {
        this.liveDataStore.Clear();
        await this.InitializeRoleHelper(messageSender.originalMessage.guild);
        this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles.Captain);
    }

    private async InitializeRoleHelper(guild: Guild)
    {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        this._serverRoleHelper = new RoleHelper(roles);
    }

    private async BeginAssigning(messageSender: MessageSender, detailed: boolean)
    {
        const progressMessage = await messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
        const teams = await this.liveDataStore.GetTeams();
        await messageSender.Edit(progressMessage, "Loading Discord Members.");
        const messagesLog: MessageHelper<MessageOptions>[] = [];
        try
        {
            const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            await messageSender.Edit(progressMessage, "Members loaded. \n Assigning Now.");
            let count = 0;
            let progressCount = 1;
            let steps = 10;
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName)))
            {
                count++;
                let messageHelper = await this.AssignValidRoles(messageSender, team, guildMembers);
                if (messageHelper)
                {
                    messagesLog.push(messageHelper);
                    if (detailed)
                    {
                        if (!messageHelper.Options.HasValue)
                        {
                            await messageSender.SendMessage(messageHelper.CreateStringMessage());
                        }
                    }
                }
                if (count > (teams.length / steps) * progressCount)
                {
                    await messageSender.Edit(progressMessage, `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                    progressCount++;
                }
            }
            if (!detailed)
            {
                fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
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
        catch (e)
        {
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
        for (var message of messagesLog)
        {
            if (!message.Options.HasCaptain)
            {
                teamsWithNoValidCaptain.push(message.Options.TeamName);
            }
            if (message.Options.PlayersInDiscord < 3)
            {
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

        await messageSender.SendMessage(messageHelper.CreateStringMessage());
        await progressMessage.delete();
    }

    private async AssignValidRoles(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[])
    {
        const teamName = team.teamName;
        let result = new MessageHelper<MessageOptions>(team.teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageSender, result, teamName);
        const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
        const divRoleOnDiscord = roleRsponse.div == NGSRoles.Storm ? null : roleRsponse.role;
        await this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
        return result;
    }

    private async CreateOrFindTeamRole(messageSender: MessageSender, messageTracker: MessageHelper<MessageOptions>, teamName: string)
    {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1)
        {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this._serverRoleHelper.lookForRole(teamName);
        if (!teamRoleOnDiscord)
        {
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

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], messageTracker: MessageHelper<MessageOptions>, teamRole: Role, divRole: Role): Promise<MessageHelper<MessageOptions>>
    {
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == team.teamName);

        messageTracker.Options = new MessageOptions(team.teamName);
        // messageTracker.Options.TeamRole = teamRole;
        messageTracker.AddNewLine("**Team Name**");;
        messageTracker.AddNewLine(team.teamName);
        messageTracker.AddNewLine("**Users**");
        for (let user of teamUsers)
        {
            const guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
            messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (guildMember)
            {
                messageTracker.Options.PlayersInDiscord++;
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                messageTracker.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                messageTracker.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                if (teamRole != null && !this.HasRole(rolesOfUser, teamRole))
                {
                    await this.AssignRole(guildMember, teamRole);
                    messageTracker.Options.AssignedTeamCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${teamRole?.name}`);
                }
                if (divRole != null && !this.HasRole(rolesOfUser, divRole))
                {
                    await this.AssignRole(guildMember, divRole);
                    messageTracker.Options.AssignedDivCount++;
                    messageTracker.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                    messageTracker.AddJSONLine(`**Assigned Role:**: ${divRole?.name}`);
                }

                if (user.IsCaptain || user.IsAssistantCaptain)
                {
                    if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole))
                    {
                        await this.AssignRole(guildMember, this._captainRole);
                        messageTracker.Options.AssignedCaptainCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                    }
                    if (user.IsCaptain)
                        messageTracker.Options.HasCaptain = true;
                }
            }
            else
            {
                messageTracker.AddNewLine(`**No Matching DiscordId Found**`, 4);
            }
        }

        return messageTracker;
    }

    private async AssignRole(guildMember: GuildMember, divRole: Role)
    {
        if (!this._testing)
            await guildMember.roles.add(divRole);
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role)
    {
        return rolesOfUser.find(role => role == roleToLookFor);
    }

}


class MessageOptions
{
    public AssignedTeamCount: number = 0;
    public AssignedDivCount: number = 0;
    public AssignedCaptainCount: number = 0;
    public PlayersInDiscord: number = 0;
    public HasCaptain: boolean;
    public CreatedTeamRole: boolean;
    public TeamRole: Role;

    constructor(public TeamName: string)
    {

    }

    public get HasValue()
    {
        if (this.AssignedCaptainCount > 0)
            return true;
        if (this.AssignedDivCount > 0)
            return true;
        if (this.AssignedCaptainCount > 0)
            return true;
        return false;
    }
}
