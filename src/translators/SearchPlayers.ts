import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { Globals } from "../Globals";
import { INGSUser } from "../interfaces";
import { Message } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { NonNGSTranslatorBase } from "./bases/nonNGSTranslatorBase";
import { SearchPlayersWorker } from "../workers/SearchPlayersWorker";

export class SearchPlayers extends NonNGSTranslatorBase {

    public get commandBangs(): string[] {
        return ["name"];
    }

    public get description(): string {
        return "searches for players by name.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new SearchPlayersWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}