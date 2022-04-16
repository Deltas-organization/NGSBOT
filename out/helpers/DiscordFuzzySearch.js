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
exports.DiscordFuzzySearch = void 0;
const Globals_1 = require("../Globals");
class DiscordFuzzySearch {
    static FindGuildMember(user, guildMembers) {
        var _a;
        const ngsDiscordId = user.discordId;
        if (ngsDiscordId) {
            let members = guildMembers.filter(member => member.user.id == ngsDiscordId);
            if (members.length == 1)
                return { member: members[0], updateDiscordId: false };
        }
        const ngsDiscordTag = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return null;
        var member = DiscordFuzzySearch.FindByDiscordTag(ngsDiscordTag, guildMembers);
        if (member)
            return { member: member, updateDiscordId: true };
        else
            return null;
    }
    static FindByDiscordTag(ngsDiscordTag, guildMembers) {
        const information = DiscordFuzzySearch.SplitNameAndDiscriminator(ngsDiscordTag);
        if (!information || !information.discriminator || !information.name)
            return;
        const discriminator = information.discriminator;
        const name = information.name;
        const filteredByDiscriminator = guildMembers.filter(member => member.user.discriminator == discriminator);
        const possibleMembers = [];
        for (let member of filteredByDiscriminator) {
            const discordName = DiscordFuzzySearch.GetDiscordId(member.user);
            if (discordName == ngsDiscordTag) {
                return member;
            }
            else if (member.user.username.toLowerCase().indexOf(name) > -1) {
                Globals_1.Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${member.user.username}`);
                possibleMembers.push(member);
            }
        }
        if (possibleMembers.length == 1) {
            return possibleMembers[0];
        }
    }
    static SplitNameAndDiscriminator(ngsDiscordTag) {
        const splitNgsDiscord = ngsDiscordTag.split("#");
        if (splitNgsDiscord.length < 2)
            return null;
        const ngsUserName = splitNgsDiscord[0];
        return { name: ngsUserName, discriminator: splitNgsDiscord.pop() };
    }
    static CompareGuildUser(user, guildUser) {
        var _a;
        if (user.discordId) {
            if (user.discordId == guildUser.id)
                return true;
        }
        const ngsDiscordTag = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return false;
        const information = DiscordFuzzySearch.SplitNameAndDiscriminator(ngsDiscordTag);
        if (!information || !information.discriminator || !information.name)
            return false;
        const discriminator = information.discriminator;
        const name = information.name;
        if (guildUser.discriminator != discriminator)
            return false;
        const discordName = DiscordFuzzySearch.GetDiscordId(guildUser);
        if (discordName == ngsDiscordTag) {
            return true;
        }
        else if (guildUser.username.toLowerCase().indexOf(name) > -1) {
            Globals_1.Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${guildUser.username}`);
            return true;
        }
        return false;
    }
    static GetDiscordId(guildUser) {
        return `${guildUser.username}#${guildUser.discriminator}`.replace(' ', '').toLowerCase();
    }
    static GetNGSUser(user, users) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var ngsUser of users) {
                if (DiscordFuzzySearch.CompareGuildUser(ngsUser, user)) {
                    return ngsUser;
                }
            }
            return null;
        });
    }
}
exports.DiscordFuzzySearch = DiscordFuzzySearch;
//# sourceMappingURL=DiscordFuzzySearch.js.map