import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { NonCastedWorker } from "../workers/NonCastedWorker";
import { TranslatorBase } from "./bases/translatorBase";

export class NonCastedGamesCommand extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["noncasted"];
    }

    public get description(): string {
        return "Will Return the games that don't currently have a caster. Can Specify a number to clamp the result within that number of days in the future.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new NonCastedWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}