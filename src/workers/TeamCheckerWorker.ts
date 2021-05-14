import { Translationhelpers } from "../helpers/TranslationHelpers";
import { INGSTeam } from "../interfaces";
import { WorkerBase } from "./Bases/WorkerBase";

export class TeamCheckerWorker extends WorkerBase {
    protected async Start(commands: string[]) {
        const foundTeams = [];
        for (var i = 0; i < commands.length; i++)
        {
            const fields = [];
            const searchTerm = commands[i];
            const teams = await this.SearchforTeams(searchTerm);
            if (teams.length <= 0)
            {
                fields.push({ name: `No teams found for  \n`, value: searchTerm });
                await this.messageSender.SendFields(``, fields);
            }
            else
            {
                for (var team of teams)
                {
                    if (foundTeams.indexOf(team) > -1)
                        continue;
                        
                    foundTeams.push(team);
                    let teamMessage = this.GetTeamMessage(team);
                    await this.messageSender.SendFields(``, teamMessage);
                }
            }
        }
    }

    private GetTeamMessage(team: INGSTeam): any[]
    {
        let result = [];
        result.push({ name: "TeamName", value: `\u0009 ${Translationhelpers.GetTeamURL(team.teamName)}`, inline: true });
        result.push({ name: "Division", value: `\u0009 ${team.divisionDisplayName}`, inline: true });
        result.push({ name: "Description", value: `\u0009 ${team.descriptionOfTeam} -`, inline: true });
        let firstValueArray = [];
        let secondValueArray = [];
        let thirdValueArray = [];
        let playerLength = team.teamMembers.length;
        for (var i = 0; i < playerLength; i += 3)
        {
            let player = team.teamMembers[i];
            firstValueArray.push('\u0009' + player.displayName.split("#")[0]);
            if (i + 1 < playerLength)
            {
                player = team.teamMembers[i + 1];
                secondValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
            if (i + 2 < playerLength)
            {
                player = team.teamMembers[i + 2];
                thirdValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
        }
        result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
        return result;
    }

}