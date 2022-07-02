import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
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

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new LeaveWorker(this.translatorDependencies, detailed, messageSender, this.CreateMongoHelper());
        await worker.Begin(commands);
    }
}