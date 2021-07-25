import { MessageSender } from "../helpers/MessageSender";
import { LeaveWorker } from "../workers/LeaveWorker";
import { NGSOnlyTranslatorBase } from "./bases/ngsOnlyTranslatorBase";


const fs = require('fs');

export class Leave extends NGSOnlyTranslatorBase {

    public get commandBangs(): string[] {
        return ["leave"];
    }

    public get description(): string {
        return "Will prompt user for role removals.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new LeaveWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}