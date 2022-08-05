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
        const assignRolesWorker = new AssignRolesWorker(this.translatorDependencies, detailed, messageSender, this.apiKey, this.CreateMongoHelper());
        await assignRolesWorker.Begin(commands);
        await messageSender.SendReactionMessage("Should I attempt to update nicknames?",
            (user) => user == messageSender.GuildMember,
            async () => {
                const worker = new ChangeCaptainNickNameWorker(this.translatorDependencies, detailed, messageSender);
                await worker.Begin(commands);
            });
    }
}