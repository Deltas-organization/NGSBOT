import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { TeamCheckerWorker } from "../workers/TeamCheckerWorker";
import { NonNGSTranslatorBase } from "./bases/nonNGSTranslatorBase";

export class TeamNameChecker extends NonNGSTranslatorBase
{
    public get commandBangs(): string[]
    {
        return ["team"];
    }

    public get description(): string
    {
        return "Will List Teams containing the values, Supports multiple searches with the space delimeter. And can include spaces by wraping the search in double quotes.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: RespondToMessageSender)
    {
        const worker = new TeamCheckerWorker(this.translatorDependencies, detailed, message);
        await worker.Begin(commands);
    }
}