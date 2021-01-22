"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purge = void 0;
const Globals_1 = require("../Globals");
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
var fs = require('fs');
class Purge extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._stopIteration = false;
        this._reservedRoleNames = [
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
            '@everyone'
        ];
        this._divRoles = [
            'Storm Division',
            'Heroic Division',
            'Division A',
            'Division B',
            'Division C',
            'Division D',
            'Division E',
        ];
        this._reserveredRoles = [];
    }
    get commandBangs() {
        return ["purge"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this._stopIteration = false;
            const guildMembers = messageSender.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            this.ReloadResservedRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const messages = [];
            let rollingMessage = "";
            for (let member of guildMembers) {
                const teamInformation = yield this.FindInTeam(member.user, teams);
                let message = "";
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
                yield messageSender.SendMessage(message);
            }
            if (rollingMessage.length > 0)
                yield messageSender.SendMessage(rollingMessage);
        });
    }
    ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                console.log(`didnt find role: ${roleName}`);
        }
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    FindInTeam(guildUser, teams) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const discordName = `${guildUser.username}#${guildUser.discriminator}`.toLowerCase();
            for (var team of teams) {
                const teamName = team.teamName;
                const allUsers = yield this.liveDataStore.GetUsers();
                const teamUsers = allUsers.filter(user => user.teamName == teamName);
                for (var ngsUser of teamUsers) {
                    const ngsDiscordId = (_a = ngsUser.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
                    if (discordName == ngsDiscordId) {
                        return new teamInformation(team, ngsUser);
                    }
                }
            }
            return null;
        });
    }
    PurgeAllRoles(guildMember) {
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
        return null;
    }
    PurgeUnrelatedRoles(guildMember, teamInformation) {
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
    lookForRole(userRoles, roleName) {
        let groomedRoleName = this.GroomRoleNameAsLowerCase(roleName);
        for (const role of userRoles) {
            let groomedServerRole = this.GroomRoleNameAsLowerCase(role.name);
            if (groomedServerRole === groomedRoleName)
                return role;
        }
        return null;
    }
    GroomRoleNameAsLowerCase(roleName) {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }
        roleNameTrimmed = roleNameTrimmed.toLowerCase();
        roleNameTrimmed.replace(' ', '');
        return roleNameTrimmed;
    }
}
exports.Purge = Purge;
class teamInformation {
    constructor(NGSTeam, NGSUser) {
        this.NGSTeam = NGSTeam;
        this.NGSUser = NGSUser;
    }
}
//# sourceMappingURL=Purge.js.map