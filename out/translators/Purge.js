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
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const NGSDivisionRoles_1 = require("../enums/NGSDivisionRoles");
const fs = require('fs');
class Purge extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._captainRoleName = 'Captains';
        this._reservedRoleNames = [
            this._captainRoleName,
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
            'Cupid Captain',
            'Trait Value',
            NGSDivisionRoles_1.DivisionRole.Storm,
            '@everyone'
        ];
        this._divRoleNames = [
            NGSDivisionRoles_1.DivisionRole.Heroic,
            NGSDivisionRoles_1.DivisionRole.DivA,
            NGSDivisionRoles_1.DivisionRole.DivB,
            NGSDivisionRoles_1.DivisionRole.DivC,
            NGSDivisionRoles_1.DivisionRole.DivD,
            NGSDivisionRoles_1.DivisionRole.DivE,
            NGSDivisionRoles_1.DivisionRole.Nexus,
        ];
        this._reserveredRoles = [];
        this._divRoles = [];
    }
    get commandBangs() {
        return ["purge"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildMembers = (yield messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            this.liveDataStore.Clear();
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            this.ReloadResservedRoles();
            this.ReloadDivRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const messages = [];
            for (let member of guildMembers) {
                const teamInformation = yield this.FindInTeam(member.user, teams);
                const messageSender = new MessageHelper_1.MessageHelper(member.user.username);
                messageSender.Options.rolesRemovedCount = 0;
                if (teamInformation == null) {
                    messageSender.AddNewLine(`No Team Found.`);
                    yield this.PurgeAllRoles(member, messageSender);
                }
                else {
                    messageSender.AddNewLine(`Team Found: **${teamInformation.NGSTeam.teamName}**`);
                    yield this.PurgeUnrelatedRoles(member, teamInformation, messageSender);
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
            yield messageSender.SendMessage(`Finished Purging Roles! \n
        Removed ${filteredMessages.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);
        });
    }
    ReloadResservedRoles() {
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
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
    }
    ReloadDivRoles() {
        this._divRoles = [];
        for (var roleName of this._divRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole) {
                this._divRoles.push(foundRole);
            }
            else {
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    FindInTeam(guildUser, teams) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var team of teams) {
                const teamName = team.teamName;
                const allUsers = yield this.liveDataStore.GetUsers();
                const teamUsers = allUsers.filter(user => user.teamName == teamName);
                for (var ngsUser of teamUsers) {
                    const foundGuildUser = DiscordFuzzySearch_1.DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser);
                    if (foundGuildUser) {
                        return new teamInformation(team, ngsUser);
                    }
                }
            }
            return null;
        });
    }
    PurgeAllRoles(guildMember, messageHelper) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            for (var role of rolesOfUser) {
                if (!this._reserveredRoles.find(serverRole => serverRole.name == role.name)) {
                    if (this._myRole.comparePositionTo(role) > 0)
                        try {
                            yield guildMember.roles.remove(role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                        }
                        catch (e) {
                            Globals_1.Globals.log("Error removing roles", e);
                        }
                }
            }
            return null;
        });
    }
    PurgeUnrelatedRoles(guildMember, teamInformation, messageHelper) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                let teamDiv = this.FindDivRole(teamInformation.NGSTeam.divisionDisplayName);
                const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(/ /g, '');
                for (var role of rolesOfUser) {
                    let groomedName = this.GroomRoleNameAsLowerCase(role.name);
                    if (!this._reserveredRoles.find(serverRole => groomedName == this.GroomRoleNameAsLowerCase(serverRole.name))) {
                        if (groomedName == teamName) {
                            messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                        }
                        else if (role == this._captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain)) {
                            messageHelper.AddNewLine("Kept Captain Role.", 4);
                        }
                        else if (role == teamDiv) {
                            messageHelper.AddNewLine(`Kept Div: ${role.name}.`, 4);
                        }
                        else if (this._myRole.comparePositionTo(role) > 0) {
                            yield guildMember.roles.remove(role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                        }
                    }
                }
            }
            catch (e) {
                Globals_1.Globals.log("Error removing roles", e);
            }
        });
    }
    FindDivRole(divisionDisplayName) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
                divRoleName = NGSDivisionRoles_1.DivisionRole.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = NGSDivisionRoles_1.DivisionRole.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSDivisionRoles_1.DivisionRole.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = NGSDivisionRoles_1.DivisionRole.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = NGSDivisionRoles_1.DivisionRole.DivE;
                break;
            case "nexus":
                divRoleName = NGSDivisionRoles_1.DivisionRole.Nexus;
                break;
            case "heroic":
                divRoleName = NGSDivisionRoles_1.DivisionRole.Heroic;
                break;
            case "storm":
                return null;
        }
        return this.lookForRole(this._serverRoles, divRoleName);
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
        roleNameTrimmed = roleNameTrimmed.replace(/ /g, '');
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