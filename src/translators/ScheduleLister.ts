import { MessageSender } from "../helpers/MessageSender";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { NGSDivisions } from "../enums/NGSDivisions";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { ScheduleWorker } from "../workers/ScheduleWorker";

export class ScheduleLister extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["Schedule", "sch"];
    }

    public get description(): string {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new ScheduleWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}