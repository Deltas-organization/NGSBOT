import { Message, User } from "discord.js";
import { MeasureMemoryMode } from "vm";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { MessageSender } from "../helpers/MessageSender";
import { NGSHelpers } from "../helpers/NGSHelpers";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSTeam } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { TranslatorBase } from "./bases/translatorBase";

export class GamesCommand extends TranslatorBase
{
    private _messageCommand: (message: string, storeMessage?: boolean) => Promise<Message>;
    private _multiMessageCommand: (message: string[], storeMessage?: boolean) => Promise<Message[]>;

    public get commandBangs(): string[]
    {
        return ["games"];
    }

    public get description(): string
    {
        return "Will Return the games for the team of the person sending the command.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        this._messageCommand = (message: string, _?: boolean) => messageSender.DMMessage(message);
        this._multiMessageCommand = (messages: string[], _?: boolean) => messageSender.DMMessages(messages);
        if (detailed)
        {
            this._messageCommand = (message: string, storeMessage?: boolean) => messageSender.SendMessage(message, storeMessage);
            this._multiMessageCommand = (messages: string[], storeMessage?: boolean) => messageSender.SendMessages(messages, storeMessage);
        }

        let messages: string[];
        if (commands.length <= 0)
        {
            messages = await this.GetMessagesForMessageSender(messageSender);
        }
        else        
        {
            messages = await this.GetMessagesForTeam(commands.join(" "));
        }

        if (messages)
        {
            if (messages.length > 0)
                await this._multiMessageCommand(messages);
            else
            {
                var random1 = Math.round(Math.random() * 99) + 1;
                if (random1 == 65)
                {
                    await this._messageCommand("Borntoshine has been notified of your failings.");
                }
                else
                {
                    await this._messageCommand("Nothing scheduled yet.");
                }
            }
            if (!detailed)
            {
                messageSender.originalMessage.delete();
            }
        }

    }

    private async GetMessagesForMessageSender(messageSender: MessageSender)
    {
        const ngsUser = await this.GetNGSUser(messageSender.Requester);
        if (!ngsUser)
        {
            await this._messageCommand("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.")
            return;
        }

        const team = await this.GetTeam(ngsUser);
        if (!team)
        {
            await this._messageCommand("Unable to find your ngsTeam");
            return;
        }
        let result: string[] = [];
        const teamMessage = await this.CreateTeamMessage(team);
        result.push(teamMessage.CreateStringMessage())
        result = result.concat(await this.GetScheduleMessages(team))

        return result;
    }

    private async GetMessagesForTeam(teamSearchTerm: string): Promise<string[]>
    {
        let teams = NGSHelpers.SearchforTeam(await this.liveDataStore.GetTeams(), teamSearchTerm);
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

    private async GetNGSUser(user: User): Promise<AugmentedNGSUser | undefined>
    {
        const users = await this.liveDataStore.GetUsers();
        for (var ngsUser of users)
        {
            if (DiscordFuzzySearch.CompareGuildUser(ngsUser, user))
            {
                return ngsUser;
            }
        }
        return null;
    }

    private async GetTeam(ngsUser: AugmentedNGSUser)
    {
        const teams = await this.liveDataStore.GetTeams();
        for (var team of teams)
        {
            if (team.teamName == ngsUser.teamName)
            {
                return team;
            }
        }
        return null;
    }

    private async CreateTeamMessage(ngsTeam: INGSTeam)
    {
        const message = new MessageHelper<any>("Team");
        message.AddNew(`**Games for: ${ngsTeam.teamName}**`);
        message.AddEmptyLine();
        return message;
    }

    private async GetScheduleMessages(ngsTeam: INGSTeam)
    {
        const scheduledGames = await this.liveDataStore.GetSchedule();
        const sortedGames = scheduledGames.sort((s1, s2) =>
        {
            let f1Date = new Date(+s1.scheduledTime.startTime);
            let f2Date = new Date(+s2.scheduledTime.startTime);
            let timeDiff = f1Date.getTime() - f2Date.getTime();
            if (timeDiff > 0)
                return 1;
            else if (timeDiff < 0)
                return -1;
            return 0;
        });
        const todaysUTC = this.ConvertDateToUTC(new Date());
        const teamsGames: INGSSchedule[] = [];

        for (var schedule of sortedGames)
        {
            if (schedule.home.teamName == ngsTeam.teamName ||
                schedule.away.teamName == ngsTeam.teamName)
            {
                let scheduledDate = new Date(+schedule.scheduledTime.startTime);
                let scheduledUTC = this.ConvertDateToUTC(scheduledDate)
                var ms = scheduledUTC.getTime() - todaysUTC.getTime();
                if (ms > 0)
                {
                    teamsGames.push(schedule);
                }
            }
        }

        return await ScheduleHelper.GetMessages(teamsGames);
    }

    private ConvertDateToUTC(date: Date): Date
    {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }


}