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
class DiscordFuzzySearch {
    static FindGuildMember(user, guildMembers) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ngsDiscordId = user.discordId;
            let returnResult = null;
            let foundById = false;
            if (ngsDiscordId) {
                let members = guildMembers.filter(member => member.user.id == ngsDiscordId);
                if (members.length == 1) {
                    foundById = true;
                    returnResult = { member: members[0], updateDiscordId: false };
                }
            }
            const ngsDiscordTag = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
            if (!ngsDiscordTag)
                return null;
            var member = DiscordFuzzySearch.FindByDiscordTag(ngsDiscordTag, guildMembers);
            if (member) {
                if (foundById && returnResult) {
                    if (returnResult.member.id != member.id) {
                        return { member: member, updateDiscordId: true };
                    }
                }
                return { member: member, updateDiscordId: !foundById };
            }
            else if (foundById) {
                return returnResult;
            }
            else {
                return null;
            }
        });
    }
    static FindByDiscordTag(ngsDiscordTag, guildMembers) {
        const foundGuildMember = guildMembers.filter(member => member.user.username == ngsDiscordTag);
        if (foundGuildMember.length == 1)
            return foundGuildMember[0];
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
            //Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${guildUser.username}`)
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