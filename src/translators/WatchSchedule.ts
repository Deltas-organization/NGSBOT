import { Guild, GuildMember, Role } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { WatchScheduleWorker } from "../workers/WatchScheduleWorker";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";

export class WatchSchedule extends AdminTranslatorBase
{
    public get commandBangs(): string[]
    {
        return ["watch"];
    }

    public get description(): string
    {
        return "Will watch for schedules games daily and post in the channel";
    }

    public get delimiter() {
        return ',';
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        const watchWorker = new WatchScheduleWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
        await watchWorker.Begin(commands);
    }
}