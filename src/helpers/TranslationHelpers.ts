export class Translationhelpers
{    
    public static GetTeamURL(teamName: string)
    {
        return `[${teamName}](https://www.nexusgamingseries.org/teamProfile/${teamName.replace(/ /g, '_')})`;
    }
}