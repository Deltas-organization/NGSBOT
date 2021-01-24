import { INGSHistory } from "./INGSHistory";

export interface INGSTeam {
    teamMembers: [{ displayName: string }];
    captain: string;
    teamName: string;
    divisionDisplayName: string;
    assistantCaptain: string[];
    descriptionOfTeam: string;
    history: INGSHistory[];
}