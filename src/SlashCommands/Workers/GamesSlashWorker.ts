import { User } from "discord.js";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../../helpers/MessageHelper";
import { ScheduleHelper } from "../../helpers/ScheduleHelper";
import { INGSTeam } from "../../interfaces";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";

export class GamesSlashWorker {

    public constructor(
        private user: User, 
        private dataStore: DataStoreWrapper){

    }

    public async Run() : Promise<MessageContainer> {
        const response = new MessageContainer();
        const ngsUser = await DiscordFuzzySearch.GetNGSUser(this.user, await this.dataStore.GetUsers());
        if (!ngsUser) {
            response.AddSimpleGroup("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.");
            return response;
        }

        const team = await this.dataStore.LookForRegisteredTeam(ngsUser);
        if (!team) {
            response.AddSimpleGroup("Unable to find your ngsTeam");
            return response;
        }
        response.AddSimpleGroup(`Games for: **${team.teamName}**`);
        var messages = await this.GetScheduleMessages(team);
        response.Append(messages);
        return response;
    }
    
    private async CreateTeamMessage(ngsTeam: INGSTeam) {
        const message = new MessageHelper<any>("Team");
        message.AddNew(`Games for: **${ngsTeam.teamName}**`);
        message.AddEmptyLine();
        return message;
    }
    
    private async GetScheduleMessages(ngsTeam: INGSTeam): Promise<MessageGroup> {
        var response = new MessageGroup();
        let games = ScheduleHelper.GetGamesSorted(await this.dataStore.GetScheduledGames(), 99);
        games = games.filter(game => game.home.teamName == ngsTeam.teamName || game.away.teamName == ngsTeam.teamName);
        var messages = await ScheduleHelper.GetMessages(games);
        messages.forEach(m => {
            response.AddOnNewLine(m);
        });
        return response
    }
}