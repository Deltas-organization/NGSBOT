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
exports.PurgeWorker = void 0;
const NGSRoles_1 = require("../enums/NGSRoles");
const Globals_1 = require("../Globals");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const RoleWorkerBase_1 = require("./Bases/RoleWorkerBase");
const fs = require('fs');
class PurgeWorker extends RoleWorkerBase_1.RoleWorkerBase {
    constructor() {
        super(...arguments);
        this._testing = false;
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length > 0)
                this._testing = true;
            yield this.BeginPurge();
        });
    }
    BeginPurge() {
        return __awaiter(this, void 0, void 0, function* () {
            const progressMessage = yield this.messageSender.SendMessage("Beginning Purge \n  Loading teams now.");
            const teams = yield this.dataStore.GetTeams();
            yield this.messageSender.Edit(progressMessage, `Purging STARTED... STAND BY...`);
            const messages = [];
            const guildMembers = (yield this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            let count = 0;
            let progressCount = 1;
            for (let member of guildMembers) {
                count++;
                const teamInformation = yield this.FindInTeam(member.user, teams);
                const messageHelper = new MessageHelper_1.MessageHelper(member.user.username);
                messageHelper.Options.rolesRemovedCount = 0;
                const shouldContinue = yield this.ShouldRemoveRoles(member);
                if (shouldContinue) {
                    if (teamInformation == null) {
                        messageHelper.AddNewLine(`No Team Found.`);
                        yield this.PurgeAllRoles(member, messageHelper);
                    }
                    else {
                        messageHelper.AddNewLine(`Team Found: ** ${teamInformation.NGSTeam.teamName} ** `);
                        yield this.PurgeUnrelatedRoles(member, teamInformation, messageHelper);
                    }
                }
                else {
                    messageHelper.Options.ignoredUser = true;
                    messageHelper.AddNewLine(`Didn't remove roles for: ${member.displayName}`);
                }
                messages.push(messageHelper);
                if (count > (guildMembers.length / 4) * progressCount) {
                    yield this.messageSender.Edit(progressMessage, `Purging \n Progress: ${progressCount * 25}%`);
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
            this.messageSender.TextChannel.send({
                files: [{
                        attachment: './files/purgedRoles.json',
                        name: 'purgedRoles.json'
                    }]
            }).catch(console.error);
            yield this.messageSender.SendMessage(`Finished Purging Roles! \n
            Removed ${removedRoles.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);
            yield progressMessage.delete();
        });
    }
    ShouldRemoveRoles(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            if (guildMember.user.username == "Murda") {
                Globals_1.Globals.log("didnt remove murdas roles");
                return false;
            }
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            if (rolesOfUser.find(role => role == this.stormRole))
                return false;
            return true;
        });
    }
    FindInTeam(guildUser, teams) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var team of teams) {
                const teamName = team.teamName;
                const allUsers = yield this.dataStore.GetUsers();
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
                if (!this.reserveredRoles.find(serverRole => serverRole == role)) {
                    if (this.myBotRole.comparePositionTo(role) > 0) {
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
            }
        });
    }
    PurgeUnrelatedRoles(guildMember, teamInformation, messageHelper) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(/ /g, '');
                let teamDivRole = (_a = this.roleHelper.FindDivRole(teamInformation.NGSTeam.divisionDisplayName)) === null || _a === void 0 ? void 0 : _a.role;
                let teamRole = this.roleHelper.lookForRole(teamName);
                const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                for (var role of rolesOfUser) {
                    if (!this.reserveredRoles.find(serverRole => role == serverRole)) {
                        if (role == teamRole) {
                            messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                        }
                        else if (role == teamDivRole) {
                            messageHelper.AddNewLine(`Kept Div: ${role.name}.`, 4);
                        }
                        else if (role == this.captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain)) {
                            messageHelper.AddNewLine("Kept Captain Role.", 4);
                        }
                        else if (this.myBotRole.comparePositionTo(role) > 0) {
                            yield this.RemoveRole(guildMember, role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                        }
                    }
                    else if (role.name == NGSRoles_1.NGSRoles.FreeAgents) {
                        if (this.myBotRole.comparePositionTo(role) > 0) {
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
exports.PurgeWorker = PurgeWorker;
class teamInformation {
    constructor(NGSTeam, NGSUser) {
        this.NGSTeam = NGSTeam;
        this.NGSUser = NGSUser;
    }
}
//# sourceMappingURL=PurgeWorker.js.map