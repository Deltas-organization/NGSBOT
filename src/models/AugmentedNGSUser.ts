import { INGSRank, INGSUser } from "../interfaces";
import { INGSHistory } from "../interfaces/INGSHistory";

export class AugmentedNGSUser implements INGSUser
{
    public displayName: string;
    public teamName: string;
    public discordTag: string;
    public discordId: string;
    public verifiedRankHistory: INGSRank[];
    public IsCaptain: boolean;
    public IsAssistantCaptain: boolean;
    public history: INGSHistory[];

    constructor(ngsUser: INGSUser)
    {
        this.displayName = ngsUser.displayName;
        this.teamName = ngsUser.teamName;
        this.discordTag = ngsUser.discordTag;
        this.verifiedRankHistory = ngsUser.verifiedRankHistory;
        this.discordId = ngsUser.discordId;
    }    
}