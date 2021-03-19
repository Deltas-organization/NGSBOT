import { User } from "discord.js";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageSender } from "../helpers/MessageSender";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSTeam } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { TranslatorBase } from "./bases/translatorBase";

export class CheckTeamSchedule extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["games"];
    }

    public get description(): string {
        return "Will Return the games for the team of the person sending the command.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const ngsUser = await this.GetNGSUser(messageSender.Requester);
        if (!ngsUser) {
            await messageSender.SendMessage("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.")
            return;
        }

        const team = await this.GetTeam(ngsUser);
        if (!team) {
            await messageSender.SendMessage("Unable to find your ngsTeam");
            return;
        }

        const messages = await this.GetScheduleMessages(team);
        if (messages) {
            const messagesAsOne = messages.join('');
            if (messagesAsOne.trim().length > 0)
                await messageSender.SendMessage(messagesAsOne);
            else {
                var random1 = Math.round(Math.random() * 99) + 1;
                if (random1 == 65) {
                    await messageSender.SendMessage("Borntoshine has been notified of your failings.");
                }
                else {
                    await messageSender.SendMessage("Nothing scheduled yet.");
                }
            }
        }
    }

    private async GetNGSUser(user: User): Promise<AugmentedNGSUser | undefined> {
        const users = await this.liveDataStore.GetUsers();
        for (var ngsUser of users) {
            if (DiscordFuzzySearch.CompareGuildUser(ngsUser, user)) {
                return ngsUser;
            }
        }
        return null;
    }

    private async GetTeam(ngsUser: AugmentedNGSUser) {
        const teams = await this.liveDataStore.GetTeams();
        for (var team of teams) {
            if (team.teamName == ngsUser.teamName) {
                return team;
            }
        }
        return null;
    }

    private async GetScheduleMessages(ngsTeam: INGSTeam) {
        const scheduledGames = await this.liveDataStore.GetSchedule();
        const sortedGames = scheduledGames.sort((s1, s2) => {
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

        for (var schedule of sortedGames) {
            if (schedule.home.teamName == ngsTeam.teamName ||
                schedule.away.teamName == ngsTeam.teamName) {
                let scheduledDate = new Date(+schedule.scheduledTime.startTime);
                let scheduledUTC = this.ConvertDateToUTC(scheduledDate)
                var ms = scheduledUTC.getTime() - todaysUTC.getTime();
                if (ms > 0) {
                    teamsGames.push(schedule);
                }
            }
        }

        return await ScheduleHelper.GetMessages(teamsGames);
    }

    private ConvertDateToUTC(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }


}