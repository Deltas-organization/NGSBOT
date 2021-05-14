import { Message, User } from "discord.js";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { MessageSender } from "../helpers/MessageSender";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { INGSTeam } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { GamesWorker } from "../workers/GamesWorker";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { TranslatorBase } from "./bases/translatorBase";

export class GamesCommand extends TranslatorBase {
    public get commandBangs(): string[] {
        return ["games"];
    }

    public get description(): string {
        return "Will Return the games for the team of the person sending the command.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new GamesWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}