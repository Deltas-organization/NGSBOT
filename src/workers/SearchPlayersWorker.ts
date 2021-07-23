import { MessageHelper } from "../helpers/MessageHelper";
import { INGSRank, INGSUser } from "../interfaces";
import { WorkerBase } from "./Bases/WorkerBase";

export class SearchPlayersWorker extends WorkerBase {
    protected async Start(commands: string[]) {

        var message = "";
        for (var i = 0; i < commands.length; i++) {
            var playerName = commands[i];
            if (this.detailed)
                var players = await this.SearchForPlayersByAPI(playerName);
            else
                var players = await this.SearchForPlayersInCurrentSeason(playerName);
            if (players.length <= 0)
                message += `No players found for: ${playerName} \n`;
            else
                message += this.CreatePlayerMessage(players);

            message += "\n";
        }
        await this.messageSender.SendMessage(message);
    }

    private async SearchForPlayersByAPI(searchTerm: string): Promise<INGSUser[]> {
        return await this.dataStore.GetUsersByApi(searchTerm);
    }

    private CreatePlayerMessage(players: INGSUser[]) {
        let message = new MessageHelper();
        players.forEach(p => {
            message.AddNewLine(`**Name**: ${p.displayName}`);
            if (p.teamName)
                message.AddNewLine(`**TeamName**: ${p.teamName}`);
            else
                message.AddNewLine("**No Team Found**");

            for (var rank of p.verifiedRankHistory.sort(this.RankHistorySort)) {
                if (rank.status == 'verified')
                    message.AddNewLine(`${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}**`);
            }
            message.AddEmptyLine();
        });
        return message.CreateStringMessage();
    }

    private RankHistorySort(history1: INGSRank, history2: INGSRank): number {
        if (history1.year > history2.year)
            return -1;
        else if (history1.year < history2.year)
            return 1;

        if (history1.season > history2.season)
            return -1;
        else
            return 1;
    }

}