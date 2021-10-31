import { Message } from "discord.js";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { INGSTeam } from "../interfaces";
import { WorkerBase } from "./Bases/WorkerBase";

export class GamesWorker extends WorkerBase {    
    private _messageCommand: (message: string, storeMessage?: boolean) => Promise<Message>;
    private _multiMessageCommand: (message: string[], storeMessage?: boolean) => Promise<Message[]>;

    protected async Start(commands: string[]) {
        this._messageCommand = (message: string, _?: boolean) => this.messageSender.DMMessage(message);
        this._multiMessageCommand = (messages: string[], _?: boolean) => this.messageSender.DMMessages(messages);
        if (this.detailed) {
            this._messageCommand = (message: string, storeMessage?: boolean) => this.messageSender.SendMessage(message, storeMessage);
            this._multiMessageCommand = (messages: string[], storeMessage?: boolean) => this.messageSender.SendMessages(messages, storeMessage);
        }

        let messages: string[];
        if (commands.length <= 0) {
            messages = await this.GetMessagesForMessageSender();
        }
        else {
            messages = await this.GetMessagesForTeam(commands.join(" "));
        }

        if (messages) {
            if (messages.length > 0)
                await this._multiMessageCommand(messages);
            else {
                // var random1 = Math.round(Math.random() * 99) + 1;
                // if (random1 == 65) {
                //     await this._messageCommand("Borntoshine has been notified of your failings.");
                // }
                // else {
                    await this._messageCommand("Nothing scheduled yet.");
                //}
            }
            if (!this.detailed) {
                this.messageSender.originalMessage.delete();
            }
        }

    }

    private async GetMessagesForMessageSender() {
        const ngsUser = await DiscordFuzzySearch.GetNGSUser(this.messageSender.Requester, await this.dataStore.GetUsers());
        if (!ngsUser) {
            await this._messageCommand("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.")
            return;
        }

        const team = await this.dataStore.LookForRegisteredTeam(ngsUser);
        if (!team) {
            await this._messageCommand("Unable to find your ngsTeam");
            return;
        }
        let result: string[] = [];
        const teamMessage = await this.CreateTeamMessage(team);
        result.push(teamMessage.CreateStringMessage())
        result = result.concat(await this.GetScheduleMessages(team))

        return result;
    }

    private async GetMessagesForTeam(teamSearchTerm: string): Promise<string[]> {
        let teams = await this.SearchForRegisteredTeams(teamSearchTerm);
        if (teams.length < 1)
            return ["No team found"];
        else if (teams.length > 1)
            return ["More then one team returned."];

        const team = teams[0];
        let result: string[] = [];
        const teamMessage = await this.CreateTeamMessage(team);
        result.push(teamMessage.CreateStringMessage())
        result = result.concat(await this.GetScheduleMessages(team))

        return result;
    }

    private async CreateTeamMessage(ngsTeam: INGSTeam) {
        const message = new MessageHelper<any>("Team");
        message.AddNew(`Games for: **${ngsTeam.teamName}**`);
        message.AddEmptyLine();
        return message;
    }

    private async GetScheduleMessages(ngsTeam: INGSTeam) {
        let games = ScheduleHelper.GetGamesSorted(await this.dataStore.GetSchedule());
        games = games.filter(game => game.home.teamName == ngsTeam.teamName || game.away.teamName == ngsTeam.teamName);
        return await ScheduleHelper.GetMessages(games);
    }
}