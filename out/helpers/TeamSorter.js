"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSorter = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
class TeamSorter {
    static SortByTeam(team1, team2) {
        return this.SortByDivision(team1.divisionDisplayName, team2.divisionDisplayName);
    }
    static SortByDivision(divisionDisplay1, divisionDisplay2) {
        const order = [NGSDivisions_1.NGSDivisions.Storm,
            NGSDivisions_1.NGSDivisions.Heroic,
            NGSDivisions_1.NGSDivisions.Nexus,
            NGSDivisions_1.NGSDivisions.AEast,
            NGSDivisions_1.NGSDivisions.AWest,
            NGSDivisions_1.NGSDivisions.BSouthEast,
            NGSDivisions_1.NGSDivisions.BNorthEast,
            NGSDivisions_1.NGSDivisions.BWest,
            NGSDivisions_1.NGSDivisions.CEast,
            NGSDivisions_1.NGSDivisions.CWest,
            NGSDivisions_1.NGSDivisions.DEast,
            NGSDivisions_1.NGSDivisions.DWest,
            NGSDivisions_1.NGSDivisions.EEast,
            NGSDivisions_1.NGSDivisions.EWest];
        for (var current of order) {
            if ((divisionDisplay1 === null || divisionDisplay1 === void 0 ? void 0 : divisionDisplay1.indexOf(current)) > -1) {
                return -1;
            }
            else if ((divisionDisplay2 === null || divisionDisplay2 === void 0 ? void 0 : divisionDisplay2.indexOf(current)) > -1) {
                return 1;
            }
        }
        return 0;
    }
}
exports.TeamSorter = TeamSorter;
//# sourceMappingURL=TeamSorter.js.map