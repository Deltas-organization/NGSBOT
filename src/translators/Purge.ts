import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { PurgeWorker } from "../workers/PurgeWorker";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";


const fs = require('fs');

export class Purge extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["purge"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new PurgeWorker(this.translatorDependencies, detailed, messageSender, this.CreateMongoHelper());
        await worker.Begin(commands);
    }
}