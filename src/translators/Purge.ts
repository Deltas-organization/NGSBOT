import { Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam, INGSUser } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { NGSRoles } from "../enums/NGSRoles";
import { RoleHelper } from "../helpers/RoleHelper";


const fs = require('fs');

export class Purge extends ngsTranslatorBase
{

    private _testing = false;

    private _reservedRoleNames: string[] = [
        'Caster Hopefuls',
        NGSRoles.FreeAgents,
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'Cupid Captain',
        'Trait Value',
        NGSRoles.Storm,
        '@everyone'];

    private _reserveredRoles: Role[] = [];
    private _myRole: Role;
    private _captainRole: Role;
    private _stormRole: Role;

    private _serverRoleHelper: RoleHelper;

    public get commandBangs(): string[]
    {
        return ["purge"];
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
        await this.BeginPurge(messageSender);
    }

    private async Setup(messageSender: MessageSender)
    {
        this.dataStore.Clear();
        await this.InitializeRoleHelper(messageSender.originalMessage.guild);
        this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles.Captain);
        this._myRole = this._serverRoleHelper.lookForRole(NGSRoles.NGSBot);
        this._stormRole = this._serverRoleHelper.lookForRole(NGSRoles.Storm);
        this._reserveredRoles = this.GetReservedRoles();
    }

    private async InitializeRoleHelper(guild: Guild)
    {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        this._serverRoleHelper = new RoleHelper(roles);
    }

    private GetReservedRoles(): Role[]
    {
        const result = [];
        for (var roleName of this._reservedRoleNames)
        {
            let foundRole = this._serverRoleHelper.lookForRole(roleName);
            if (foundRole)
            {
                result.push(foundRole);
            }
            else
            {
                Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }

    private async BeginPurge(messageSender: MessageSender)
    {
        const progressMessage = await messageSender.SendMessage("Beginning Purge \n  Loading teams now.");
        const teams = await this.dataStore.GetTeams();
        await messageSender.Edit(progressMessage, `Purging STARTED... STAND BY...`);
        const messages: MessageHelper<IPurgeInformation>[] = [];
        const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
        let count = 0;
        let progressCount = 1;
        for (let member of guildMembers)
        {
            count++;
            const teamInformation = await this.FindInTeam(member.user, teams);
            const messageHelper = new MessageHelper<IPurgeInformation>(member.user.username);
            messageHelper.Options.rolesRemovedCount = 0;
            const shouldContinue = await this.ShouldRemoveRoles(member);
            if (shouldContinue)
            {
                if (teamInformation == null)
                {
                    messageHelper.AddNewLine(`No Team Found.`);
                    await this.PurgeAllRoles(member, messageHelper);
                }
                else
                {
                    messageHelper.AddNewLine(`Team Found: ** ${teamInformation.NGSTeam.teamName} ** `);
                    await this.PurgeUnrelatedRoles(member, teamInformation, messageHelper);
                }
            }
            else
            {
                messageHelper.Options.ignoredUser = true;
                messageHelper.AddNewLine(`Didn't remove roles for: ${member.displayName}`);
            }

            messages.push(messageHelper);
            if (count > (guildMembers.length / 4) * progressCount)
            {
                await messageSender.Edit(progressMessage, `Purging \n Progress: ${progressCount * 25}%`);
                progressCount++;
            }
        }

        let removedRoles = messages.filter(message => message.Options.rolesRemovedCount > 0);
        let ignoredUsers = messages.filter(messages => messages.Options.ignoredUser);

        fs.writeFileSync('./files/purgedRoles.json', JSON.stringify({
            affectedUserCount: removedRoles.length,
            detailedInformation: removedRoles.map(message => message.CreateJsonMessage()),
            ignoredUsers: ignoredUsers.map(message => message.CreateStringMessage())
        }));
        messageSender.TextChannel.send({
            files: [{
                attachment: './files/purgedRoles.json',
                name: 'purgedRoles.json'
            }]
        }).catch(console.error);

        await messageSender.SendMessage(`Finished Purging Roles! \n
        Removed ${removedRoles.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);

        await progressMessage.delete();
    }

    private async ShouldRemoveRoles(guildMember: GuildMember)
    {
        if (guildMember.user.username == "Murda")
        {
            Globals.log("didnt remove murdas roles");
            return false;
        }

        const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
        if (rolesOfUser.find(role => role == this._stormRole))
            return false;

        return true;
    }

    private async FindInTeam(guildUser: User, teams: INGSTeam[]): Promise<teamInformation>
    {
        for (var team of teams)
        {
            const teamName = team.teamName;
            const allUsers = await this.dataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            for (var ngsUser of teamUsers)
            {
                const foundGuildUser = DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser)
                if (foundGuildUser)
                {
                    return new teamInformation(team, ngsUser);
                }
            }
        }

        return null;
    }

    private async PurgeAllRoles(guildMember: GuildMember, messageHelper: MessageHelper<IPurgeInformation>): Promise<void>
    {
        const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
        for (var role of rolesOfUser)
        {
            if (!this._reserveredRoles.find(serverRole => serverRole == role))
            {
                if (this._myRole.comparePositionTo(role) > 0)
                    try
                    {
                        await this.RemoveRole(guildMember, role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                    }
                    catch (e)
                    {
                        Globals.log("Error removing roles", e);
                    }
            }
        }
    }

    private async PurgeUnrelatedRoles(guildMember: GuildMember, teamInformation: teamInformation, messageHelper: MessageHelper<any>): Promise<void>
    {
        try
        {
            const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(/ /g, '');
            let teamDivRole = this._serverRoleHelper.FindDivRole(teamInformation.NGSTeam.divisionDisplayName)?.role;
            let teamRole = this._serverRoleHelper.lookForRole(teamName);
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            for (var role of rolesOfUser)
            {
                if (!this._reserveredRoles.find(serverRole => role == serverRole))
                {
                    if (role == teamRole)
                    {
                        messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                    }
                    else if (role == teamDivRole)
                    {
                        messageHelper.AddNewLine(`Kept Div: ${role.name}.`, 4);
                    }
                    else if (role == this._captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain))
                    {
                        messageHelper.AddNewLine("Kept Captain Role.", 4);
                    }
                    else if (this._myRole.comparePositionTo(role) > 0)
                    {
                        await this.RemoveRole(guildMember, role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                    }
                }
                else if (role.name == NGSRoles.FreeAgents)
                {
                    if (this._myRole.comparePositionTo(role) > 0)
                    {
                        await this.RemoveRole(guildMember, role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                    }
                }
            }
        }
        catch (e)
        {
            Globals.log("Error removing roles", e);
        }
    }

    private async RemoveRole(guildMember: GuildMember, role: Role)
    {
        if (!this._testing)
            await guildMember.roles.remove(role);
    }
}

class teamInformation
{
    constructor(public NGSTeam: INGSTeam, public NGSUser: AugmentedNGSUser) { }
}

interface IPurgeInformation
{
    rolesRemovedCount: number;
    ignoredUser: boolean;
}