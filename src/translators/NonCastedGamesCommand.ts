import { Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { MessageSender } from "../helpers/MessageSender";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { NonCastedWorker } from "../workers/NonCastedWorker";
import { SpecificChannelBase } from "./bases/SpecificChannelBase";
import { TranslatorBase } from "./bases/translatorBase";

export class NonCastedGamesCommand extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["noncasted"];
    }

    public get description(): string {
        return "Will Return the games that don't currently have a caster. Can Specify a number to clamp the result within that number of days in the future.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new NonCastedWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}