import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { DisplayUnusedRoles } from "../workers/DisplayUnusedRoles";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";

const fs = require('fs');

export class UnUsedRoles extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["roles"];
    }

    public get description(): string {
        return "Will Check all roles in the server and compare to team on the webstie.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const rolesWorker = new DisplayUnusedRoles(this.translatorDependencies, detailed, messageSender, this.CreateMongoHelper());
        await rolesWorker.Begin(commands);
    }
}