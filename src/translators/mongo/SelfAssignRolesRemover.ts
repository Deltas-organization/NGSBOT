import { MessageSender } from "../../helpers/MessageSender";
import { SelfAssignRolesRemoverWorker } from "../../workers/Mongo/SelfAssignRolesRemoverWorker";
import { AdminTranslatorBase } from "../bases/adminTranslatorBase";

export class SelfAssignRolesRemover extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["unself"];
    }

    public get description(): string {
        return "Will remove currently assignable roles for your discord.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const watchWorker = new SelfAssignRolesRemoverWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
        await watchWorker.Begin(commands);
    }
}