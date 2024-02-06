"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSorter = void 0;
const NGSDivisionConcat_1 = require("../enums/NGSDivisionConcat");
const NGSDivisions_1 = require("../enums/NGSDivisions");
class TeamSorter {
    static SortByTeamDivision(team1, team2) {
        return this.SortByDivision(team1.divisionDisplayName, team2.divisionDisplayName);
    }
    static SortByTeamName(team1, team2) {
        if (team1.teamName.toUpperCase() < team2.teamName.toUpperCase())
            return -1;
        else
            return 1;
    }
    static SortByDivision(divisionDisplay1, divisionDisplay2) {
        const order = [
            NGSDivisions_1.NGSDivisions.Heroic,
            NGSDivisions_1.NGSDivisions.Nexus,
            NGSDivisions_1.NGSDivisions.A,
            // NGSDivisions.AEast,
            // NGSDivisions.AWest,
            NGSDivisions_1.NGSDivisions.B,
            NGSDivisions_1.NGSDivisions.CEast,
            NGSDivisions_1.NGSDivisions.CWest,
            NGSDivisions_1.NGSDivisions.DEast,
            NGSDivisions_1.NGSDivisions.DWest,
            NGSDivisionConcat_1.NGSDivisionConcat.E
        ];
        //NGSDivisions.EEast,
        //NGSDivisions.EWest];
        for (var current of order) {
            var division1Index = divisionDisplay1 === null || divisionDisplay1 === void 0 ? void 0 : divisionDisplay1.indexOf(current);
            if (!division1Index)
                return -1;
            if (division1Index > -1) {
                return -1;
            }
            var division2Index = divisionDisplay2 === null || divisionDisplay2 === void 0 ? void 0 : divisionDisplay2.indexOf(current);
            if (!division2Index)
                return 1;
            if (division2Index > -1) {
                return 1;
            }
        }
        return 0;
    }
    static SortByDivisionConcat(divisionDisplay1, divisionDisplay2) {
        const order = [
            NGSDivisionConcat_1.NGSDivisionConcat.Heroic,
            NGSDivisionConcat_1.NGSDivisionConcat.Nexus,
            NGSDivisionConcat_1.NGSDivisionConcat.A,
            // NGSDivisionConcat.AEast,
            // NGSDivisionConcat.AWest,
            NGSDivisionConcat_1.NGSDivisionConcat.BEast,
            NGSDivisionConcat_1.NGSDivisionConcat.BWest,
            NGSDivisionConcat_1.NGSDivisionConcat.CEast,
            NGSDivisionConcat_1.NGSDivisionConcat.CWest,
            NGSDivisionConcat_1.NGSDivisionConcat.DEast,
            NGSDivisionConcat_1.NGSDivisionConcat.DWest,
            // NGSDivisionConcat.EEast,
            // NGSDivisionConcat.EWest
            NGSDivisionConcat_1.NGSDivisionConcat.E
        ];
        for (var current of order) {
            var division1Index = divisionDisplay1 === null || divisionDisplay1 === void 0 ? void 0 : divisionDisplay1.indexOf(current);
            if (!division1Index)
                return -1;
            if (division1Index > -1) {
                return -1;
            }
            var division2Index = divisionDisplay2 === null || divisionDisplay2 === void 0 ? void 0 : divisionDisplay2.indexOf(current);
            if (!division2Index)
                return 1;
            if (division2Index > -1) {
                return 1;
            }
        }
        return 0;
    }
}
exports.TeamSorter = TeamSorter;
//# sourceMappingURL=TeamSorter.js.map