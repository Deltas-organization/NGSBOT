import { INGSTeam } from "../interfaces";

export class NGSHelpers {
    public static SearchforTeam(allTeams: INGSTeam[], searchTerm: string) : INGSTeam[]
    {
        const searchRegex = new RegExp(searchTerm, 'i');
        return allTeams.filter(team => searchRegex.test(team.teamName));
    }
}