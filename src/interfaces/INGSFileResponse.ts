import { INGSPlayer } from "./INGSPlayer";
import { INGSTeam } from "./INGSTeam";
import { INGSDivision } from "./INGSDivision";

export interface INGSFileResponse {
    Players: INGSPlayer[]
    DateTicks: number;
    LastFileNames: string[];
    Teams: INGSTeam[];
    Divisions: INGSDivision[];
}