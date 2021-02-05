import { INGSRank, INGSUser } from "../interfaces";

export class AugmentedNGSUser implements INGSUser
{
    public displayName: string;
    public teamName: string;
    public discordTag: string;
    public verifiedRankHistory: INGSRank[];
    public IsCaptain: boolean;
    public IsAssistantCaptain: boolean;

    constructor(ngsUser: INGSUser)
    {
        this.displayName = ngsUser.displayName;
        this.teamName = ngsUser.teamName;
        this.discordTag = ngsUser.discordTag;
        this.verifiedRankHistory = ngsUser.verifiedRankHistory;
    }    
}