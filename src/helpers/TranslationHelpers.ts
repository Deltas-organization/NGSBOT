import { INGSPlayer } from "../interfaces/INGSPlayer";
import { INGSTeam } from "../interfaces/INGSTeam";

export class Translationhelpers
{    
    public static GetPlayerUrl(player: INGSPlayer)
    {
        return `[${player.Name.split('#')[0]}](${player.ProfileURL})`;
    }

    public static GetTeamURL(teamName: string)
    {
        return `[${teamName}](https://www.nexusgamingseries.org/teamProfile/${teamName.replace(/ /g, '_')})`;
    }
}