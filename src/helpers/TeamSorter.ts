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
        NGSDivisions.AEast,
        NGSDivisions.AWest,
        NGSDivisions.BSouthEast,
        NGSDivisions.BNorthEast,
        NGSDivisions.BWest,
        NGSDivisions.CEast,
        NGSDivisions.CWest,
        NGSDivisions.DEast,
        NGSDivisions.DWest,
        NGSDivisions.EEast,
        NGSDivisions.EWest];

        for (var current of order) {
            if (divisionDisplay1?.indexOf(current) > -1) {
                return -1;
            }
            else if (divisionDisplay2?.indexOf(current) > -1) {
                return 1;
            }
        }
        return 0;
    }
}