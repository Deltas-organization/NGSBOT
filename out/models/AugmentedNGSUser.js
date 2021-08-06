"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AugmentedNGSUser = void 0;
class AugmentedNGSUser {
    constructor(ngsUser) {
        this.displayName = ngsUser.displayName;
        this.teamName = ngsUser.teamName;
        this.discordTag = ngsUser.discordTag;
        this.verifiedRankHistory = ngsUser.verifiedRankHistory;
        this.discordId = ngsUser.discordId;
    }
}
exports.AugmentedNGSUser = AugmentedNGSUser;
//# sourceMappingURL=AugmentedNGSUser.js.map