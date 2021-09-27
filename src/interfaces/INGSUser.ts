import { INGSHistory } from "./INGSHistory";
import { INGSRank } from "./INGSRank";

export interface INGSUser
{
    displayName: string;
    teamName: string;
    discordTag: string;
    discordId: string;
    verifiedRankHistory: INGSRank[],
    history: INGSHistory[]
}