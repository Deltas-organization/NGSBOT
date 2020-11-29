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
const globals_1 = require("../globals");
var fs = require('fs');
class CheckUsers extends adminTranslatorBase_1.AdminTranslatorBase {
    constructor(translatorDependencies, liveDataStore) {
        super(translatorDependencies);
        this.liveDataStore = liveDataStore;
    }
    get commandBangs() {
        return ["check"];
    }
    get description() {
        return "Will Check all users for discord tags and relevant team roles.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let members = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            let availableRoles = message.originalMessage.guild.roles.cache.map((role, _, __) => role.name);
            globals_1.Globals.log(`available Roles: ${availableRoles}`);
            for (var member of members) {
                yield this.findUserInNGS(message, member, availableRoles);
            }
        });
    }
    findUserInNGS(message, guildMember, serverRoles) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const guildUser = guildMember.user;
            let users = yield this.liveDataStore.GetUsers();
            let discordName = `${guildUser.username}#${guildUser.discriminator}`;
            let messageContainer = [];
            for (var user of users) {
                let ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
                if (ngsDiscordId == discordName.toLowerCase()) {
                    var roles = guildMember.roles.cache.map((role, _, __) => role.name);
                    const hasRole = this.lookForRole(roles, user.teamName);
                    if (hasRole)
                        continue;
                    const roleOnServer = this.lookForRole(serverRoles, user.teamName);
                    globals_1.Globals.log(`User: ${guildUser.username} on Team: ${user.teamName}. Doesn't have a matching role, current user Roles: ${roles}. Found Existing role: ${roleOnServer}`);
                    //await this.askUserTheirTeam(message, guildMember, user);
                    return true;
                }
            }
            // await message.SendMessage('unable to find user, no matching discord id registered.');
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
            const lowerCaseRole = role.toLowerCase().trim();
            if (lowerCaseRole === team)
                return role;
            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');
            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }
    askUserTheirTeam(message, guildMember, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = message.originalMessage.guild.roles.cache.find(r => r.name.toLowerCase() === user.teamName.toLowerCase());
            globals_1.Globals.log(role);
            let sentMessage = yield message.SendMessage(`${user.displayName.split("#")[0]} are you on team: ${user.teamName}?`);
            yield sentMessage.react('✅');
            yield sentMessage.react('❌');
            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === guildMember.id;
            };
            try {
                var collectedReactions = yield sentMessage.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
                if (collectedReactions.first().emoji.name === '✅') {
                    message.originalMessage.member.roles.add(role);
                }
                if (collectedReactions.first().emoji.name === '❌') {
                    message.originalMessage.member.roles.remove(role);
                }
            }
            catch (_a) {
                sentMessage.reactions.removeAll();
            }
        });
    }
}
exports.CheckUsers = CheckUsers;
//# sourceMappingURL=CheckUsers.js.map