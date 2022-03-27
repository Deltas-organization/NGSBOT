import { INGSRank, INGSTeam, INGSUser } from "../interfaces";
import { INGSHistory } from "../interfaces/INGSHistory";

export class AugmentedNGSUser implements INGSUser {
    public displayName: string;
    public teamName: string;
    public discordTag: string;
    public discordId: string;
    public verifiedRankHistory: INGSRank[];
    public IsCaptain: boolean;
    public IsAssistantCaptain: boolean;
    public DivisionDisplayName: string;
    public history: INGSHistory[];

    constructor(ngsUser: INGSUser, team: INGSTeam) {
        this.displayName = ngsUser.displayName;
        this.teamName = ngsUser.teamName;
        this.discordTag = ngsUser.discordTag;
        this.verifiedRankHistory = ngsUser.verifiedRankHistory;
        this.discordId = ngsUser.discordId;
        this.Setup(team)
    }

    private Setup(team: INGSTeam) {
        const captainName = team.captain.toLowerCase();
        const assistantCaptains = team.assistantCaptain.map(ac => ac.toLowerCase());
        this.DivisionDisplayName = team.divisionDisplayName;
        const lowerCaseDisplayName = this.displayName.toLowerCase();
        if (lowerCaseDisplayName == captainName) {
            this.IsCaptain = true;
        }
        else if (assistantCaptains?.find(ac => ac == lowerCaseDisplayName)) {
            this.IsAssistantCaptain = true;
        }
    }

    public static CreateFromMultiple(ngsUsers: INGSUser[], team: INGSTeam): AugmentedNGSUser[] {
        var result: AugmentedNGSUser[] = [];
        for (var ngsUser of ngsUsers) {
            var user = new AugmentedNGSUser(ngsUser, team);
            result.push(user);
        }
        return result;
    }
}