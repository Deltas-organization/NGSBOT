import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { AssignRolesWorker } from "../workers/AssignRolesWorker";
import { ChangeCaptainNickNameWorker } from "../workers/ChangeCaptainNickNameWorker";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["assign"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const assignRolesWorker = new AssignRolesWorker(this.translatorDependencies, detailed, messageSender, this.apiKey);
        await assignRolesWorker.Begin(commands);

        const worker = new ChangeCaptainNickNameWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}