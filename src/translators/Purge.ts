import { Client, Guild, GuildMember, Role, TextChannel, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { debug } from "console";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";

var fs = require('fs');

export class Purge extends ngsTranslatorBase {

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
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'FA Combine',
        '@everyone'];

    private _divRoles: string[] = [
        'Storm Division',
        'Heroic Division',
        'Division A',
        'Division B',
        'Division C',
        'Division D',
        'Division E',
    ]

    private _reserveredRoles: Role[] = [];
    private _myRole: Role;

    public get commandBangs(): string[] {
        return ["purge"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        this._stopIteration = false;
        const guildMembers = messageSender.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        this.ReloadResservedRoles();

        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const messages: string[] = [];
        let rollingMessage = "";
        for (let member of guildMembers) {
            const teamInformation = await this.FindInTeam(member.user, teams);
            let message ="";
            if (teamInformation == null) {
                message += `No Team Found \n`;
                var purgeMessage = this.PurgeAllRoles(member);
            }
            else {
                message += `Team Found: **${teamInformation.NGSTeam.teamName}** \n`;
                var purgeMessage = this.PurgeUnrelatedRoles(member, teamInformation);
            }

            if (purgeMessage) {
                message += purgeMessage + "\n";
                if (rollingMessage.length + message.length >= 2048) {
                    messages.push(rollingMessage);
                    rollingMessage = message;
                }
                else {
                    rollingMessage += message;
                }
            }
        }
        for (let message of messages) {
            await messageSender.SendMessage(message);
        }
        if (rollingMessage.length > 0)
            await messageSender.SendMessage(rollingMessage);
    }

    private ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                console.log(`didnt find role: ${roleName}`);
        }
    }

    private ReloadServerRoles(guild: Guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async FindInTeam(guildUser: User, teams: INGSTeam[]): Promise<teamInformation> {
        const discordName = `${guildUser.username}#${guildUser.discriminator}`.toLowerCase();
        for (var team of teams) {
            const teamName = team.teamName;
            const allUsers = await this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            for (var ngsUser of teamUsers) {
                const ngsDiscordId = ngsUser.discordTag?.replace(' ', '').toLowerCase();
                if (discordName == ngsDiscordId) {
                    return new teamInformation(team, ngsUser);
                }
            }
        }

        return null;
    }

    private PurgeAllRoles(guildMember: GuildMember): string {
        const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
        let messages = [];
        messages.push(`\u200B \u200B User: **${guildMember.user.username}** `);
        for (var role of rolesOfUser) {
            if (!this._reserveredRoles.find(serverRole => serverRole.name == role.name)) {
                if (this._myRole.comparePositionTo(role) > 0)
                    try {
                        //await guildMember.roles.remove(role);
                        messages.push(`\u200B \u200B \u200B \u200B Removed Role: ${role}`);
                    }
                    catch (e) {

                    }
            }
        }
        if (messages.length > 1)
            return messages.join("\n") + '\n';

        return null
    }

    private PurgeUnrelatedRoles(guildMember: GuildMember, teamInformation: teamInformation): string {
        try {
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            let messages = [];
            messages.push(`\u200B \u200B User: **${guildMember.user.username}** `);
            // let teamDiv = teamInformation.NGSTeam.divisionDisplayName.split(' ')[0];
            // let divRole = this._divRoles.find(role => {
            //     return role.toLowerCase().replace("division", "").trim() == teamDiv
            // });
            for (var role of rolesOfUser) {
                let groomedName = this.GroomRoleNameAsLowerCase(role.name);
                if (!this._reserveredRoles.find(serverRole => groomedName == this.GroomRoleNameAsLowerCase(serverRole.name))) {
                    // if (groomedName == divRole?.toLowerCase()) {
                    //     //await guildMember.roles.remove(role);
                    //     messages.push(`\u200B \u200B \u200B \u200B Kept Role: ${role}`);
                    // }
                    if (groomedName == teamInformation.NGSTeam.teamName.toLowerCase()) {
                        //await guildMember.roles.remove(role);
                        messages.push(`\u200B \u200B \u200B \u200B Kept: ${role}`);

                    }
                    else if (this._myRole.comparePositionTo(role) > 0)
                        //await guildMember.roles.remove(role);
                        messages.push(`\u200B \u200B \u200B \u200B Removed: ${role}`);
                }
            }
            if (messages.length > 1)
                return messages.join("\n") + '\n';

        }
        catch (e) {

        }
        return null;
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
        roleNameTrimmed.replace(' ', '')
        return roleNameTrimmed;
    }
}

class teamInformation {
    constructor(public NGSTeam: INGSTeam, public NGSUser: INGSUser) { }
}