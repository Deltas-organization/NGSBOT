import { Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam, INGSUser } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { DivisionRole } from "../enums/NGSDivisionRoles";


const fs = require('fs');

export class Purge extends ngsTranslatorBase {

    private _serverRoles: Role[];
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
        'Cupid Captain',
        '@everyone'];


    private _reserveredRoles: Role[] = [];
    private _myRole: Role;
    private _captainRole: Role;

    public get commandBangs(): string[] {
        return ["purge"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        this.ReloadResservedRoles();

        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const messages: MessageHelper<IPurgeInformation>[] = [];
        for (let member of guildMembers) {
            const teamInformation = await this.FindInTeam(member.user, teams);
            const messageSender = new MessageHelper<IPurgeInformation>(member.user.username);
            messageSender.Options.rolesRemovedCount = 0;
            if (teamInformation == null) {
                messageSender.AddNewLine(`No Team Found.`);
                await this.PurgeAllRoles(member, messageSender);
            }
            else {
                messageSender.AddNewLine(`Team Found: **${teamInformation.NGSTeam.teamName}**`);
                await this.PurgeUnrelatedRoles(member, teamInformation, messageSender);
            }

            messages.push(messageSender);
        }
        let filteredMessages = messages.filter(message => message.Options.rolesRemovedCount > 0);

        fs.writeFileSync('./files/purgedRoles.json', JSON.stringify({
            affectedUserCount: filteredMessages.length,
            detailedInformation: filteredMessages.map(message => message.CreateJsonMessage())
        }));
        messageSender.TextChannel.send({
            files: [{
                attachment: './files/purgedRoles.json',
                name: 'purgedRoles.json'
            }]
        }).catch(console.error);
        
        await messageSender.SendMessage(`Finished Purging Roles! \n
        Removed ${filteredMessages.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);
    }

    private ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole) {
                if (foundRole.name == this._captainRoleName)
                    this._captainRole = foundRole;
                else
                    this._reserveredRoles.push(foundRole);
            }
            else {
                Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
    }

    private ReloadServerRoles(guild: Guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async FindInTeam(guildUser: User, teams: INGSTeam[]): Promise<teamInformation> {
        for (var team of teams) {
            const teamName = team.teamName;
            const allUsers = await this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            for (var ngsUser of teamUsers) {
                const foundGuildUser = DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser)
                if (foundGuildUser) {
                    return new teamInformation(team, ngsUser);
                }
            }
        }

        return null;
    }

    private async PurgeAllRoles(guildMember: GuildMember, messageHelper: MessageHelper<IPurgeInformation>): Promise<void> {
        const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
        for (var role of rolesOfUser) {
            if (!this._reserveredRoles.find(serverRole => serverRole.name == role.name)) {
                if (this._myRole.comparePositionTo(role) > 0)
                    try {
                        await guildMember.roles.remove(role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                    }
                    catch (e) {
                        Globals.log("Error removing roles", e);
                    }
            }
        }

        return null
    }

    private async PurgeUnrelatedRoles(guildMember: GuildMember, teamInformation: teamInformation, messageHelper: MessageHelper<any>): Promise<void> {
        try {
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            let teamDiv = this.FindDivRole(teamInformation.NGSTeam.divisionDisplayName);
            const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(' ', '');
            for (var role of rolesOfUser) {
                let groomedName = this.GroomRoleNameAsLowerCase(role.name);
                if (!this._reserveredRoles.find(serverRole => groomedName == this.GroomRoleNameAsLowerCase(serverRole.name))) {
                    if (groomedName == teamName) {
                        messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                    }
                    else if (role == this._captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain)) {
                        messageHelper.AddNewLine("Kept Captain Role.", 4);
                    }
                    else if (this._myRole.comparePositionTo(role) > 0) {
                        await guildMember.roles.remove(role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                    }
                }
            }
        }
        catch (e) {
            Globals.log("Error removing roles", e);
        }
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

    private lookForRole(userRoles: Role[], roleName: string): Role {
        let groomedRoleName = this.GroomRoleNameAsLowerCase(roleName);
        for (const role of userRoles) {
            let groomedServerRole = this.GroomRoleNameAsLowerCase(role.name);
            if (groomedServerRole === groomedRoleName)
                return role;
        }
        return null;
    }

    private GroomRoleNameAsLowerCase(roleName: string) {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }

        roleNameTrimmed = roleNameTrimmed.toLowerCase();
        roleNameTrimmed = roleNameTrimmed.replace(' ', '')
        return roleNameTrimmed;
    }
}

class teamInformation {
    constructor(public NGSTeam: INGSTeam, public NGSUser: AugmentedNGSUser) { }
}

interface IPurgeInformation {
    rolesRemovedCount: number;
}