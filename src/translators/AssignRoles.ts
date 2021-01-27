import { Client, Guild, GuildMember, Role, TextChannel, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { debug } from "console";

var fs = require('fs');

export class AssignRoles extends AdminTranslatorBase
{

    private _serverRoles: Role[];
    private _stopIteration = false;

    private _reservedRoleNames: string[] = [
        'Captains',
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

    public get commandBangs(): string[]
    {
        return ["assign"];
    }

    public get description(): string
    {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender)
    {
        this._stopIteration = false;
        const guildMembers = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        this.ReloadServerRoles(message.originalMessage.guild);
        this.ReloadResservedRoles();
        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const rolesNotFound = [];
        for (var team of teams)
        {
            await this.DisplayTeamInformation(message, team, guildMembers, rolesNotFound);
            if (this._stopIteration)
                break;
        }
        message.SendMessage(`Unable to find roles: ${rolesNotFound.join(', ')}`);
        console.log("Done");
    }

    private ReloadResservedRoles()
    {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames)
        {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                console.log(`didnt find role: ${roleName}`);
        }
    }

    private ReloadServerRoles(guild: Guild)
    {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async DisplayTeamInformation(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[], rolesNotFound: string[])
    {
        const teamName = team.teamName;
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == teamName);
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageSender, teamName, rolesNotFound);
        const divRoleOnDiscord = this.FindDivRole(team.divisionName);

        let message = "**Team Name** \n";
        message += `${teamName} \n`;
        message += await this.AssignUsersToRoles(teamUsers, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);

        await messageSender.SendMessage(message);
        return false;
    }

    private async CreateOrFindTeamRole(messageSender: MessageSender, teamName: string, rolesNotFound: string[])
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
            rolesNotFound.push(teamName);
            return;
            teamRoleOnDiscord = await messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
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
                divRoleName = divRoleName.DivA;
                break;
            case "b west":
            case "b east":
                divRoleName = divRoleName.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = divRoleName.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = divRoleName.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = divRoleName.DivE;
                break;
            case "storm":
            case "storm":
                divRoleName = divRoleName.Storm;
                break;
            case "heroic":
            case "heroic":
                divRoleName = divRoleName.Heroic;
                break;
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

    private FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): GuildMember
    {
        const ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
        for (let member of guildMembers)
        {
            const guildUser = member.user;
            const discordName = `${guildUser.username}#${guildUser.discriminator}`.toLowerCase();
            if (discordName == ngsDiscordId)
            {
                return member;
            }
        }
        return null;
    }

    private async AssignUsersToRoles(teamUsers: INGSUser[], guildMembers: GuildMember[], teamRole: Role, divRole: Role)
    {
        let message = "**Users** \n";
        for (let user of teamUsers)
        {
            const guildMember = this.FindGuildMember(user, guildMembers);
            message += `${user.displayName} \n`;
            if (guildMember)
            {
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                message += "\u200B \u200B \u200B \u200B **Current Roles** \n";
                message += `\u200B \u200B \u200B \u200B ${rolesOfUser.join(',')} \n`;
                if (!rolesOfUser.find(role => role == teamRole))
                {
                    //await guildMember.roles.add(teamRole);
                    message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${teamRole} \n`;
                }
                if (divRole != null && !rolesOfUser.find(role => role == divRole))
                {
                    //await guildMember.roles.add(divRole);
                    message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${divRole} \n`;
                }
            }
            else
            {
                message += `\u200B \u200B \u200B \u200B **Not Found** \n`;
            }
        }
        return message;
    }
}

enum DivisionRole
{
    DivA = 'Division A',
    DivB = 'Division B',
    DivC = 'Division C',
    DivD = 'Division D',
    DivE = 'Division E',
    Heroic = 'Heroic Division',
    Storm = 'Storm Division',
}