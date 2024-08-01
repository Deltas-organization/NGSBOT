import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";

export class ChannelHelper {
    public static GetDiscordChannelForDivision(division: NGSDivisions): DiscordChannels | null {
        switch (division) {
            case NGSDivisions.Heroic:
                return DiscordChannels.DivisionHeroic;
            case NGSDivisions.Nexus:
                return DiscordChannels.DivisionNexus;
            case NGSDivisions.A:
                return DiscordChannels.DivisionA;
            case NGSDivisions.BEast:                
            case NGSDivisions.BWest:
                return DiscordChannels.DivisionB;
            case NGSDivisions.C:
                return DiscordChannels.DivisionC;
            case NGSDivisions.DEast:
            case NGSDivisions.DWest:
                return DiscordChannels.DivisionD;
            case NGSDivisions.E:
                return DiscordChannels.DivisionE;
            default:
                return null;
        }
    }
}