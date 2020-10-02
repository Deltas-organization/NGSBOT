import { Role } from "discord.js";
import { INGSRole } from "./INGSRole";

export interface INGSPlayerDetailedInformation
{
    toonHandle: string;
    displayName: string;
    discordTag: string;
    competitiveLevel: string;
    teamName: string;
    isCaptain: boolean;
    seasonsPlayed: number;
    role: INGSRole;
}