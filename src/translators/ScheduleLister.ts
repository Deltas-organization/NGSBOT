import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { ScheduleWorker } from "../workers/ScheduleWorker";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";

export class ScheduleLister extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new ScheduleWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}