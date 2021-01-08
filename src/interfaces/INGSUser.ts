import { INGSRank } from "./INGSRank";

export interface INGSUser
{
    displayName: string;
    teamName: string;
    discordTag: string;
    verifiedRankHistory: INGSRank[]
}