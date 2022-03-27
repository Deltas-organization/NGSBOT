"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AugmentedNGSUser = void 0;
class AugmentedNGSUser {
    constructor(ngsUser, team) {
        this.displayName = ngsUser.displayName;
        this.teamName = ngsUser.teamName;
        this.discordTag = ngsUser.discordTag;
        this.verifiedRankHistory = ngsUser.verifiedRankHistory;
        this.discordId = ngsUser.discordId;
        this.Setup(team);
    }
    Setup(team) {
        const captainName = team.captain.toLowerCase();
        const assistantCaptains = team.assistantCaptain.map(ac => ac.toLowerCase());
        this.DivisionDisplayName = team.divisionDisplayName;
        const lowerCaseDisplayName = this.displayName.toLowerCase();
        if (lowerCaseDisplayName == captainName) {
            this.IsCaptain = true;
        }
        else if (assistantCaptains === null || assistantCaptains === void 0 ? void 0 : assistantCaptains.find(ac => ac == lowerCaseDisplayName)) {
            this.IsAssistantCaptain = true;
        }
    }
    static CreateFromMultiple(ngsUsers, team) {
        var result = [];
        for (var ngsUser of ngsUsers) {
            var user = new AugmentedNGSUser(ngsUser, team);
            result.push(user);
        }
        return result;
    }
}
exports.AugmentedNGSUser = AugmentedNGSUser;
//# sourceMappingURL=AugmentedNGSUser.js.map