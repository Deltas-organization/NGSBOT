import { INGSPlayerDetailedInformation } from "./INGSPlayerDetailedInformation";

export interface INGSPlayer {
    Name: string;
    TeamName: string;
    Division: string;
    ProfileURL: string;
    Pending: boolean;
    DetailedInformation: INGSPlayerDetailedInformation;
}