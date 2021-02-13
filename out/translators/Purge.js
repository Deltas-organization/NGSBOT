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
const NGSRoles_1 = require("../enums/NGSRoles");
const RoleHelper_1 = require("../helpers/RoleHelper");
const fs = require('fs');
class Purge extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._testing = false;
        this._reservedRoleNames = [
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
            NGSRoles_1.NGSRoles.Storm,
            '@everyone'
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
            if (commands.length > 0)
                this._testing = true;
            yield this.Setup(messageSender);
            yield this.BeginPurge(messageSender);
        });
    }
    Setup(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this.liveDataStore.Clear();
            yield this.InitializeRoleHelper(messageSender.originalMessage.guild);
            this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
            this._myRole = this._serverRoleHelper.lookForRole("NGSBOT");
            this._reserveredRoles = this.GetReservedRoles();
        });
    }
    InitializeRoleHelper(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            this._serverRoleHelper = new RoleHelper_1.RoleHelper(roles);
        });
    }
    GetReservedRoles() {
        const result = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this._serverRoleHelper.lookForRole(roleName);
            if (foundRole) {
                result.push(foundRole);
            }
            else {
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }
    BeginPurge(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const progressMessage = yield messageSender.SendMessage("Beginning Purge \n  Loading teams now.");
            const teams = yield this.liveDataStore.GetTeams();
            yield messageSender.Edit(progressMessage, `Purging STARTED... STAND BY...`);
            const messages = [];
            const guildMembers = (yield messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            let count = 0;
            let progressCount = 1;
            for (let member of guildMembers) {
                count++;
                const teamInformation = yield this.FindInTeam(member.user, teams);
                const messageHelper = new MessageHelper_1.MessageHelper(member.user.username);
                messageHelper.Options.rolesRemovedCount = 0;
                if (teamInformation == null) {
                    messageHelper.AddNewLine(`No Team Found.`);
                    yield this.PurgeAllRoles(member, messageHelper);
                }
                else {
                    messageHelper.AddNewLine(`Team Found: ** ${teamInformation.NGSTeam.teamName} ** `);
                    yield this.PurgeUnrelatedRoles(member, teamInformation, messageHelper);
                }
                messages.push(messageHelper);
                if (count > (guildMembers.length / 4) * progressCount) {
                    yield messageSender.Edit(progressMessage, `Purging \n Progress: ${progressCount * 25}%`);
                    progressCount++;
                }
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
            yield progressMessage.delete();
        });
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
                if (!this._reserveredRoles.find(serverRole => serverRole == role)) {
                    if (this._myRole.comparePositionTo(role) > 0)
                        try {
                            yield this.RemoveRole(guildMember, role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                        }
                        catch (e) {
                            Globals_1.Globals.log("Error removing roles", e);
                        }
                }
            }
        });
    }
    PurgeUnrelatedRoles(guildMember, teamInformation, messageHelper) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(/ /g, '');
                let teamDivRole = (_a = this._serverRoleHelper.FindDivRole(teamInformation.NGSTeam.divisionDisplayName)) === null || _a === void 0 ? void 0 : _a.role;
                let teamRole = this._serverRoleHelper.lookForRole(teamName);
                const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                for (var role of rolesOfUser) {
                    if (!this._reserveredRoles.find(serverRole => role == serverRole)) {
                        if (role == teamRole) {
                            messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                        }
                        else if (role == teamDivRole) {
                            messageHelper.AddNewLine(`Kept Div: ${role.name}.`, 4);
                        }
                        else if (role == this._captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain)) {
                            messageHelper.AddNewLine("Kept Captain Role.", 4);
                        }
                        else if (this._myRole.comparePositionTo(role) > 0) {
                            yield this.RemoveRole(guildMember, role);
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
    RemoveRole(guildMember, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._testing)
                yield guildMember.roles.remove(role);
        });
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