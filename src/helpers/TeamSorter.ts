import { ContainerModule } from "inversify";
import { NGSDivisionConcat } from "../enums/NGSDivisionConcat";
import { NGSDivisions } from "../enums/NGSDivisions";
import { INGSTeam } from "../interfaces";

export class TeamSorter {
    public static SortByTeamDivision(team1: INGSTeam, team2: INGSTeam): number {
        return this.SortByDivision(team1.divisionDisplayName, team2.divisionDisplayName);
    }

    public static SortByTeamName(team1: INGSTeam, team2: INGSTeam) {
        if (team1.teamName.toUpperCase() < team2.teamName.toUpperCase())
            return -1;
        else
            return 1;
    }

    public static SortByDivision(divisionDisplay1: string, divisionDisplay2: string): number {
        const order = [NGSDivisions.Storm,
        NGSDivisions.Heroic,
        NGSDivisions.Nexus,
        NGSDivisions.A,
        // NGSDivisions.AEast,
        // NGSDivisions.AWest,
        NGSDivisions.BEast,
        NGSDivisions.BWest,
        NGSDivisions.CEast,
        NGSDivisions.CWest,
        NGSDivisions.DEast,
        NGSDivisions.DWest,
        NGSDivisions.EEast,
        NGSDivisions.EWest];

        for (var current of order) {
            var division1Index = divisionDisplay1?.indexOf(current);
            if(!division1Index)
                return -1;

            if (division1Index > -1) {
                return -1;
            }
            
            var division2Index = divisionDisplay2?.indexOf(current);
            if(!division2Index)
                return 1;

            if (division2Index > -1) {
                return 1;
            }
        }
        return 0;
    }

    public static SortByDivisionConcat(divisionDisplay1: string, divisionDisplay2: string): number {
        const order = [NGSDivisionConcat.Storm,
        NGSDivisionConcat.Heroic,
        NGSDivisionConcat.Nexus,
        NGSDivisionConcat.A,
        // NGSDivisionConcat.AEast,
        // NGSDivisionConcat.AWest,
        NGSDivisionConcat.BEast,
        NGSDivisionConcat.BWest,
        NGSDivisionConcat.CEast,
        NGSDivisionConcat.CWest,
        NGSDivisionConcat.DEast,
        NGSDivisionConcat.DWest,
        NGSDivisionConcat.EEast,
        NGSDivisionConcat.EWest];

        for (var current of order) {
            var division1Index = divisionDisplay1?.indexOf(current);
            if(!division1Index)
                return -1;

            if (division1Index > -1) {
                return -1;
            }
            
            var division2Index = divisionDisplay2?.indexOf(current);
            if(!division2Index)
                return 1;

            if (division2Index > -1) {
                return 1;
            }
        }
        return 0;
    }
}