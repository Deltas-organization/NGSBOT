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
const discord_js_1 = require("discord.js");
const NGSRoles_1 = require("../enums/NGSRoles");
const Globals_1 = require("../Globals");
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
            var muteRole = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.Muted);
            if (muteRole)
                this._mutedRole = muteRole;
            var unpurgeable = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.UnPurgeable);
            if (unpurgeable)
                this._unPurgeable = unpurgeable;
            yield this.BeginPurge();
        });
    }
    BeginPurge() {
        return __awaiter(this, void 0, void 0, function* () {
            const progressMessages = yield this.messageSender.SendMessage("Beginning Purge \n  Loading teams now.");
            const progressMessage = progressMessages[0];
            const teams = yield this.dataStore.GetTeams();
            yield progressMessage.Edit(`Purging STARTED... STAND BY...`);
            const messages = [];
            if (!this.messageSender.originalMessage.guild)
                return;
            const guildMembers = (yield this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            let count = 0;
            let progressCount = 1;
            for (let member of guildMembers) {
                count++;
                const rolesOfUser = member.roles.cache.map((role, _, __) => role);
                const messageHelper = new MessageHelper_1.MessageHelper(member.user.username);
                messageHelper.Options.rolesRemovedCount = 0;
                var unPurgeable = this.HasRole(rolesOfUser, this._unPurgeable);
                if (unPurgeable) {
                    messageHelper.Options.ignoredUser = true;
                }
                else {
                    const teamInformation = yield teams.FindUserInTeam(member.user);
                    var muted = this.HasRole(rolesOfUser, this._mutedRole);
                    var hasTeam = teamInformation != null;
                    if (!hasTeam || muted) {
                        if (muted)
                            messageHelper.AddNewLine('Removed Roles as the person is muted');
                        if (!hasTeam)
                            messageHelper.AddNewLine(`No Team Found.`);
                        yield this.PurgeAllRoles(member, messageHelper);
                    }
                    else if (teamInformation) {
                        messageHelper.AddNewLine(`Team Found: ** ${teamInformation.teamName} ** `);
                        yield this.PurgeUnrelatedRoles(member, teamInformation, messageHelper);
                    }
                }
                messages.push(messageHelper);
                if (count > (guildMembers.length / 4) * progressCount) {
                    yield progressMessage.Edit(`Purging \n Progress: ${progressCount * 25}%`);
                    progressCount++;
                }
            }
            let removedRoles = messages.filter(message => message.Options.rolesRemovedCount > 0);
            let ignoredUsers = messages.filter(messages => messages.Options.ignoredUser);
            fs.writeFileSync('./files/purgedRoles.json', JSON.stringify({
                affectedUserCount: removedRoles.length,
                detailedInformation: removedRoles.map(message => message.CreateJsonMessage()),
                ignoredUsers: ignoredUsers.map(message => message.CreateJsonMessage())
            }));
            var attachment = new discord_js_1.AttachmentBuilder('./files/purgedRoles.json');
            attachment.name = 'purgedRoles.json';
            yield this.messageSender.SendFiles([attachment]).catch(console.error);
            var message = 'Finished Purging Roles! \n';
            message += `Removed ${removedRoles.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`;
            if (this._testing)
                message += `\n except this was all a test!`;
            yield this.messageSender.SendMessage(`Finished Purging Roles! \n
            Removed ${removedRoles.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);
            yield progressMessage.Delete();
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
    ShouldRemoveRoles(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            if (guildMember.user.username == "Murda") {
                Globals_1.Globals.log("didnt remove murdas roles");
                return false;
            }
            return true;
        });
    }
    PurgeAllRoles(guildMember, messageHelper) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            for (var role of rolesOfUser) {
                if (!this.reserveredRoles.find(serverRole => serverRole == role)) {
                    if (this.myBotRole.comparePositionTo(role) > 0) {
                        try {
                            if (yield this.ShouldRemoveRoles(guildMember)) {
                                yield this.RemoveRole(guildMember, role);
                                messageHelper.Options.rolesRemovedCount++;
                                messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                            }
                            else {
                                messageHelper.Options.ignoredUser = true;
                                messageHelper.AddNewLine(`Wanted to remove role: ${role.name}, but didn't.`, 4);
                            }
                        }
                        catch (e) {
                            Globals_1.Globals.log("Error removing roles", e);
                        }
                    }
                }
            }
        });
    }
    PurgeUnrelatedRoles(guildMember, userInformation, messageHelper) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teamName = userInformation.teamName.toLowerCase().replace(/ /g, '');
                let teamDivRole = (_a = this.roleHelper.FindDivRole(userInformation.DivisionDisplayName)) === null || _a === void 0 ? void 0 : _a.role;
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
                        else if (role == this.captainRole && (userInformation.IsCaptain || userInformation.IsAssistantCaptain)) {
                            messageHelper.AddNewLine("Kept Captain Role.", 4);
                        }
                        else if (this.myBotRole.comparePositionTo(role) > 0) {
                            if (yield this.ShouldRemoveRoles(guildMember)) {
                                yield this.RemoveRole(guildMember, role);
                                messageHelper.Options.rolesRemovedCount++;
                                messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                            }
                            else {
                                messageHelper.Options.ignoredUser = true;
                                messageHelper.AddJSONLine(`Wanted to remove role: ${role.name}, but didn't.`);
                            }
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
//# sourceMappingURL=PurgeWorker.js.map