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
exports.CheckUsers = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const Globals_1 = require("../Globals");
var fs = require('fs');
class CheckUsers extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["check"];
    }
    get description() {
        return "Will Check all users for discord tags and relevant team roles.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let members = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles(message);
            for (var member of members) {
                yield this.EnsureUserRoles(message, member, detailed);
            }
        });
    }
    ReloadServerRoles(message) {
        this._serverRoles = message.originalMessage.guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    EnsureUserRoles(message, guildMember, promptEvenIfAlreadyAssignedRole) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const guildUser = guildMember.user;
            try {
                var users = yield this.liveDataStore.GetUsers();
            }
            catch (_b) {
                Globals_1.Globals.log("Problem with retrieving users");
                return;
            }
            let discordName = `${guildUser.username}#${guildUser.discriminator}`;
            for (var user of users) {
                let ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
                if (ngsDiscordId == discordName.toLowerCase()) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    let roleOnServer = this.lookForRole(this._serverRoles, user.teamName);
                    if (!roleOnServer) {
                        let role = yield this.AskIfYouWantToAddRoleToServer(message, user);
                        if (role) {
                            this._serverRoles.push(role);
                            roleOnServer = role;
                        }
                        else {
                            continue;
                        }
                    }
                    const hasRole = this.lookForRole(rolesOfUser, user.teamName);
                    if (!hasRole || promptEvenIfAlreadyAssignedRole) {
                        Globals_1.Globals.log(`User: ${guildUser.username} on Team: ${user.teamName}. Doesn't have a matching role, current user Roles: ${rolesOfUser.map(role => role.name)}. Found Existing role: ${roleOnServer.name}`);
                        var added = yield this.AskIfYouWantToAddUserToRole(message, guildMember, roleOnServer, promptEvenIfAlreadyAssignedRole);
                        if (added) {
                            yield message.SendMessage(`${guildMember.displayName} has been added to role: ${roleOnServer.name}`);
                        }
                        else if (added == false) {
                            yield message.SendMessage(`${guildMember.displayName} has been removed from role: ${roleOnServer.name}`);
                        }
                    }
                    return true;
                }
            }
            Globals_1.Globals.logAdvanced(`unable to find user: ${user.displayName}, no matching discord id registered.`);
            return false;
        });
    }
    lookForRole(userRoles, teamName) {
        let team = teamName.trim();
        const indexOfWidthdrawn = team.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            team = team.slice(0, indexOfWidthdrawn).trim();
        }
        team = team.toLowerCase();
        const teamWithoutSpaces = team.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === team)
                return role;
            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');
            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }
    AskIfYouWantToAddRoleToServer(messageSender, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let role;
            let reactionResponse = yield messageSender.SendReactionMessage(`It looks like the user: ${user.displayName} is on team: ${user.teamName}, but there is not currently a role for that team. Would you like me to create this role?`, (member) => this.IsAuthenticated(member), () => __awaiter(this, void 0, void 0, function* () {
                role = yield messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: user.teamName,
                    },
                    reason: 'needed a new team role added'
                });
            }));
            reactionResponse.message.delete();
            return role;
        });
    }
    AskIfYouWantToAddUserToRole(messageSender, memberToAskAbout, roleToManipulate, andRemove) {
        return __awaiter(this, void 0, void 0, function* () {
            let reactionResponse = yield messageSender.SendReactionMessage(`From what I can see, ${memberToAskAbout.displayName} belongs to team: ${roleToManipulate.name}, but they don't have the role at the moment.  Would you like to add${(andRemove && '/remove') || ''} them to the role?`, (member) => this.IsAuthenticated(member), () => memberToAskAbout.roles.add(roleToManipulate), () => {
                if (andRemove)
                    memberToAskAbout.roles.remove(roleToManipulate);
            });
            reactionResponse.message.delete();
            return reactionResponse.response;
        });
    }
}
exports.CheckUsers = CheckUsers;
//# sourceMappingURL=CheckUsers.js.map