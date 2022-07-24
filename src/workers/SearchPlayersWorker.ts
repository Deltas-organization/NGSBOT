import { HistoryActions } from "../enums/NGSHistoryActions";
import { MessageHelper } from "../helpers/MessageHelper";
import { Translationhelpers } from "../helpers/TranslationHelpers";
import { INGSRank, INGSUser } from "../interfaces";
import { MessageContainer, MessageGroup } from "../message-helpers/MessageContainer";
import { WorkerBase } from "./Bases/WorkerBase";

export class SearchPlayersWorker extends WorkerBase {
    protected async Start(commands: string[]) {
        var container = new MessageContainer();
        for (var i = 0; i < commands.length; i++) {
            var playerName = commands[i];
            if (this.detailed)
                var players = await this.SearchForPlayersByAPI(playerName);
            else
                var players = await this.SearchForPlayersInCurrentSeason(playerName);
            if (players.length <= 0)
                container.AddSimpleGroup(`**No players found for: ${playerName}**`);
            else
                container.Append(SearchPlayersWorker.CreatePlayerMessage(players, this.detailed))
        }
        await this.messageSender.SendMessageFromContainer(container);
    }

    private async SearchForPlayersByAPI(searchTerm: string): Promise<INGSUser[]> {
        return await this.dataStore.GetUsersByApi(searchTerm);
    }

    public static CreatePlayerMessage(players: INGSUser[], detailed: boolean): MessageGroup[] {
        var result: MessageGroup[] = [];
        players.forEach(player => {
            const message = new MessageGroup();
            message.AddOnNewLine(`**Name**: ${player.displayName}`);
            if (player.teamName)
                message.AddOnNewLine(`**TeamName**: ${Translationhelpers.GetTeamURL(player.teamName)}`);
            else
                message.AddOnNewLine("**No Team Found**");

            for (var rank of player.verifiedRankHistory.sort(SearchPlayersWorker.RankHistorySort)) {
                if (rank.status == 'verified')
                    message.AddOnNewLine(`${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}**`);
            }
            if (detailed) {
                message.Combine(SearchPlayersWorker.CreateDetailedMessage(player))
            }
            result.push(message);
        });
        return result;
    }

    private static CreateDetailedMessage(player: INGSUser): MessageGroup {
        let message = new MessageGroup()
        for (var history of player.history.sort((h1, h2) => h2.timestamp - h1.timestamp)) {
            if (history.season) {
                if (history.action == HistoryActions.LeftTeam) {
                    message.AddOnNewLine(`**Left Team**: ${history.target}. Season: ${history.season}`);
                }
                else if (history.action == HistoryActions.JoinedTeam) {
                    message.AddOnNewLine(`**Joined Team**: ${history.target}. Season: ${history.season}`);
                }
                else if (history.action == HistoryActions.CreatedTeam) {
                    message.AddOnNewLine(`**Created Team**: ${history.target}. Season: ${history.season}`);
                }
            }
        }
        return message;
    }

    private static RankHistorySort(history1: INGSRank, history2: INGSRank): number {
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