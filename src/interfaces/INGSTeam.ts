import { INGSPlayer } from "./INGSPlayer";
import { INGSPlayerDetailedInformation } from "./INGSPlayerDetailedInformation";
import { INGSHistory } from "./INGSHistory";

export interface INGSTeam
{
    TeamName: string;
    Description: string;
    CompetitiveLevel: string;
    DivisionDisplayName: string;
    Players: INGSPlayer[]
    History: INGSHistory[];
}