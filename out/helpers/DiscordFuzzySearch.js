"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordFuzzySearch = void 0;
const Globals_1 = require("../Globals");
class DiscordFuzzySearch {
    static FindGuildMember(user, guildMembers) {
        var _a;
        const ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
        if (!ngsDiscordId)
            return null;
        const splitNgsDiscord = ngsDiscordId.split("#");
        if (splitNgsDiscord.length != 2)
            return null;
        const ngsUserName = splitNgsDiscord[0].toLowerCase();
        const ngsDiscriminator = splitNgsDiscord[1];
        const filteredByDiscriminator = guildMembers.filter(member => member.user.discriminator == ngsDiscriminator);
        const possibleMembers = [];
        for (let member of filteredByDiscriminator) {
            const discordName = DiscordFuzzySearch.GetDiscordId(member.user);
            if (discordName == ngsDiscordId) {
                return member;
            }
            else if (member.user.username.toLowerCase().indexOf(ngsUserName) > -1) {
                Globals_1.Globals.log(`FuzzySearch!! Website has: ${ngsUserName}, Found: ${member.user.username}`);
                possibleMembers.push(member);
            }
        }
        if (possibleMembers.length == 1) {
            return possibleMembers[0];
        }
        return null;
    }
    static CompareGuildUser(user, guildUser) {
        var _a;
        const ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
        if (!ngsDiscordId)
            return false;
        const splitNgsDiscord = ngsDiscordId.split("#");
        if (splitNgsDiscord.length != 2)
            return false;
        const ngsUserName = splitNgsDiscord[0].toLowerCase();
        const ngsDiscriminator = splitNgsDiscord[1];
        if (guildUser.discriminator != ngsDiscriminator)
            return false;
        const discordName = DiscordFuzzySearch.GetDiscordId(guildUser);
        if (discordName == ngsDiscordId) {
            return true;
        }
        else if (guildUser.username.toLowerCase().indexOf(ngsUserName) > -1) {
            Globals_1.Globals.log(`FuzzySearch!! Website has: ${ngsUserName}, Found: ${guildUser.username}`);
            return true;
        }
        return false;
    }
    static GetDiscordId(guildUser) {
        return `${guildUser.username}#${guildUser.discriminator}`.replace(' ', '').toLowerCase();
    }
}
exports.DiscordFuzzySearch = DiscordFuzzySearch;
//# sourceMappingURL=DiscordFuzzySearch.js.map