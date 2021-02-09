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
import { DivisionRole } from "../enums/NGSDivisionRoles";

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase
{
    private _serverRoles: Role[];
    private _stopIteration = false;
    private readonly _captainRoleName = 'Captains';

    private _reservedRoleNames: string[] = [
        this._captainRoleName,
        'Caster Hopefuls',
        'Free Agents',
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        DivisionRole.Storm,
        DivisionRole.Heroic,
        DivisionRole.DivA,
        DivisionRole.DivB,
        DivisionRole.DivC,
        DivisionRole.DivD,
        DivisionRole.DivE,
        DivisionRole.Nexus,
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'FA Combine',
        '@everyone'];

    private _reserveredRoles: Role[] = [];
    private _myRole: Role;
    private _captainRole: Role;

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
        this._stopIteration = false;
        this.liveDataStore.Clear();
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        this.ReloadResservedRoles();
        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const rolesAdded = [];
        const messagesLog: MessageHelper<MessageOptions>[] = [];
        try
        {
            const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName)))
            {
                let messageHelper = await this.AssignValidRoles(messageSender, team, guildMembers, rolesAdded);
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
                if (this._stopIteration)
                    break;
            }
            if (!detailed)
            {
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
        catch (e)
        {
            Globals.log(e);
        }

        const messageHelper = new MessageHelper<any>("Success");
        messageHelper.AddNewLine("Finished Assigning Roles!");
        messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} Team Roles`);
        messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedDivCount).reduce((m1, m2) => m1 + m2, 0)} Div Roles`);
        messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles `);
        const teamsWithNoValidCaptain = [];
        for (var message of messagesLog)
        {
            if (!message.Options.HasCaptain)
            {
                teamsWithNoValidCaptain.push(message.Options.TeamName);
            }
        }
        if (teamsWithNoValidCaptain.length > 0)
            messageHelper.AddNewLine(`Teams with no Assignable Captains: ${teamsWithNoValidCaptain.join(', ')}`);
        else
            messageHelper.AddNewLine(`All teams Have a valid Captain`);

        await messageSender.SendMessage(messageHelper.CreateStringMessage());
    }

    private ReloadResservedRoles()
    {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames)
        {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
            {
                this._reserveredRoles.push(foundRole);
                if (foundRole.name == this._captainRoleName)
                    this._captainRole = foundRole;
            }
            else
                Globals.logAdvanced(`didnt find role: ${roleName}`);
        }
    }

    private ReloadServerRoles(guild: Guild)
    {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async AssignValidRoles(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[], rolesAdded: string[])
    {
        const teamName = team.teamName;
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageSender, teamName, rolesAdded);
        const divRoleOnDiscord = this.FindDivRole(team.divisionDisplayName);

        return await this.AssignUsersToRoles(team, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);
    }

    private async CreateOrFindTeamRole(messageSender: MessageSender, teamName: string, rolesAdded: string[])
    {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1)
        {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName)
        if (!teamRoleOnDiscord)
        {
            rolesAdded.push(teamName);
            teamRoleOnDiscord = await messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
                    mentionable: true,
                    hoist: true
                },
                reason: 'needed a new team role added'
            });
        }

        return teamRoleOnDiscord
    }

    private FindDivRole(divisionDisplayName: string)
    {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase())
        {
            case "a west":
            case "a east":
                divRoleName = DivisionRole.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = DivisionRole.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = DivisionRole.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = DivisionRole.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = DivisionRole.DivE;
                break;
            case "nexus":
                divRoleName = DivisionRole.Nexus;
                break;
            case "heroic":
                divRoleName = DivisionRole.Heroic;
                break;
            case "storm":
                return null;
        }
        return this.lookForRole(this._serverRoles, divRoleName);
    }

    private lookForRole(userRoles: Role[], roleName: string): Role
    {
        let roleNameTrimmed = roleName.trim().toLowerCase();

        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles)
        {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces)
            {
                return role;
            }
        }
        return null;
    }

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], teamRole: Role, divRole: Role): Promise<MessageHelper<MessageOptions>>
    {
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == team.teamName);

        let message = new MessageHelper<MessageOptions>(team.teamName);
        message.Options = new MessageOptions(team.teamName);
        message.AddNewLine("**Team Name**");;
        message.AddNewLine(team.teamName);
        message.AddNewLine("**Users**");
        for (let user of teamUsers)
        {
            const guildMember = DiscordFuzzySearch.FindGuildMember(user, guildMembers);
            message.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (guildMember)
            {
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                message.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                message.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                if (teamRole != null && !this.HasRole(rolesOfUser, teamRole))
                {
                    await guildMember.roles.add(teamRole);
                    message.Options.AssignedTeamCount++;
                    message.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                    message.AddJSONLine(`**Assigned Role:**: ${teamRole?.name}`);
                }
                if (divRole != null && !this.HasRole(rolesOfUser, divRole))
                {
                    await guildMember.roles.add(divRole);
                    message.Options.AssignedDivCount++;
                    message.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                    message.AddJSONLine(`**Assigned Role:**: ${divRole?.name}`);
                }

                if (user.IsCaptain || user.IsAssistantCaptain)
                {
                    if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole))
                    {
                        await guildMember.roles.add(this._captainRole);
                        message.Options.AssignedCaptainCount++;
                        message.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                        message.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                    }
                    if (user.IsCaptain)
                        message.Options.HasCaptain = true;
                }
            }
            else
            {
                message.AddNewLine(`**No Matching DiscordId Found**`, 4);
            }
        }

        return message;
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
    public HasCaptain: boolean;

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
