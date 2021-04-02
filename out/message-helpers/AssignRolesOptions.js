"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignRolesOptions = void 0;
class AssignRolesOptions {
    constructor(TeamName) {
        this.TeamName = TeamName;
        this.AssignedTeamCount = 0;
        this.AssignedDivCount = 0;
        this.AssignedCaptainCount = 0;
        this.PlayersInDiscord = 0;
    }
    get HasValue() {
        if (this.AssignedCaptainCount > 0)
            return true;
        if (this.AssignedDivCount > 0)
            return true;
        if (this.AssignedCaptainCount > 0)
            return true;
        return false;
    }
}
exports.AssignRolesOptions = AssignRolesOptions;
//# sourceMappingURL=AssignRolesOptions.js.map