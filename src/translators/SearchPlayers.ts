import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { SearchPlayersWorker } from "../workers/SearchPlayersWorker";
import { NonNGSTranslatorBase } from "./bases/nonNGSTranslatorBase";

export class SearchPlayers extends NonNGSTranslatorBase {

    public get commandBangs(): string[] {
        return ["name"];
    }

    public get description(): string {
        return "searches for players by name.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new SearchPlayersWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}