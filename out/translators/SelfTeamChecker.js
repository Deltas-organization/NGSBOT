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
var fs = require('fs');
class SelfTeamChecker extends translatorBase_1.TranslatorBase {
    constructor(client, liveDataStore) {
        super(client);
        this.liveDataStore = liveDataStore;
    }
    get commandBangs() {
        return ["self"];
    }
    get description() {
        return "Will Return the team name that the player requesting is on.";
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
        console.log(guild.members.cache.map((mem, _, __) => mem.user.username));
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
                console.log(ngsDiscordId);
                if (ngsDiscordId == discordName.toLowerCase()) {
                    yield message.SendMessage(`Looks like you they are on team: ${user.teamName}`);
                    return true;
                }
            }
            yield message.SendMessage('unable to find user, no matching discord id registered.');
            return false;
        });
    }
}
exports.SelfTeamChecker = SelfTeamChecker;
//# sourceMappingURL=SelfTeamChecker.js.map