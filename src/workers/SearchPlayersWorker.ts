import { INGSUser } from "../interfaces";
import { WorkerBase } from "./Bases/WorkerBase";

export class SearchPlayersWorker extends WorkerBase {
    protected async Start(commands: string[]) {
        
        var message = "";
        for (var i = 0; i < commands.length; i++) {
            var playerName = commands[i];
            var players = await this.SearchForPlayers(playerName);
            if (players.length <= 0)
                message += `No players found for: ${playerName} \n`;
            else
                message += this.CreatePlayerMessage(players);

            message += "\n";
        }
        await this.messageSender.SendMessage(message);
    }

    private CreatePlayerMessage(players: INGSUser[]) {
        let result = [];
        players.forEach(p => {
            let playerResult = '';
            playerResult += `**Name**: ${p.displayName}, \n**TeamName**: ${p.teamName} \n`;
            for (var rank of p.verifiedRankHistory) {
                if (rank.status == 'verified')
                    playerResult += `${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}** \n`;
            }
            result.push(playerResult);
        });
        return result.join("\n");
    }

}