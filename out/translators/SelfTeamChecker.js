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
exports.SelfTeamChecker = void 0;
const translatorBase_1 = require("./bases/translatorBase");
const Globals_1 = require("../Globals");
var fs = require('fs');
class SelfTeamChecker extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["self"];
    }
    get description() {
        return "Will Return the games for the team of the person sending the command.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length > 0) {
                for (var command of commands) {
                    let guildMember = this.findUserInGuid(message.originalMessage.guild, command);
                    if (guildMember) {
                        yield this.findUserInNGS(message, guildMember);
                    }
                    else
                        yield message.SendMessage(`Unable to find user: ${command}`);
                }
            }
            else {
                yield this.findUserInNGS(message, message.Requester);
            }
        });
    }
    findUserInGuid(guild, name) {
        Globals_1.Globals.log(guild.members.cache.map((mem, _, __) => mem.user.username));
        let filteredMembers = guild.members.cache.filter((member, _, __) => member.user.username.toLowerCase() == name.toLowerCase());
        if (filteredMembers.size == 1) {
            return filteredMembers.map((member, _, __) => {
                return member.user;
            })[0];
        }
    }
    findUserInNGS(message, guildMember) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let users = yield this.liveDataStore.GetUsers();
            let discordName = `${guildMember.username}#${guildMember.discriminator}`;
            for (var user of users) {
                let ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
                Globals_1.Globals.log(ngsDiscordId);
                if (ngsDiscordId == discordName.toLowerCase()) {
                    yield this.askUserTheirTeam(message, guildMember, user);
                    return true;
                }
            }
            yield message.SendMessage(`unable to find user, no matching discord id registered. DiscordName: ${discordName}`);
            return false;
        });
    }
    askUserTheirTeam(message, guildMember, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = message.originalMessage.guild.roles.cache.find(r => r.name.toLowerCase() === user.teamName.toLowerCase());
            Globals_1.Globals.log(role);
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
exports.SelfTeamChecker = SelfTeamChecker;
//# sourceMappingURL=SelfTeamChecker.js.map