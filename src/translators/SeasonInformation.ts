import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { SeasonInformationWorker } from "../workers/SeasonInformationWorker";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";


export class SeasonInformation extends DeltaTranslatorBase {
    public get commandBangs(): string[] {
        return ["season"];
    }

    public get description(): string {
        return "Will return basic season information";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new SeasonInformationWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}