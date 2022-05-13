import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { GamesWorker } from "../workers/GamesWorker";
import { TranslatorBase } from "./bases/translatorBase";

export class GamesCommand extends TranslatorBase {
    public get commandBangs(): string[] {
        return ["games"];
    }

    public get description(): string {
        return "Will Return the games for the team of the person sending the command.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new GamesWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}