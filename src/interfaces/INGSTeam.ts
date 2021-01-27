import { INGSHistory } from "./INGSHistory";

export interface INGSTeam {
    teamMembers: [{ displayName: string }];
    captain: string;
    teamName: string;
    divisionName: string;
    assistantCaptain: string[];
    descriptionOfTeam: string;
    history: INGSHistory[];
}