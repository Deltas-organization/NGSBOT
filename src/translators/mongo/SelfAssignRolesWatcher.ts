import { RespondToMessageSender } from "../../helpers/messageSenders/RespondToMessageSender";
import { SelfAssignRolesWatcherWorker } from "../../workers/Mongo/SelfAssignRolesWatcherWorker";
import { TranslatorBase } from "../bases/translatorBase";

export class SelfAssignRolesWatcher extends TranslatorBase {

    public get commandBangs(): string[] {
        return ['assign'];
    }

    public get description(): string {
        return 'Will assign you a role if the role is available. -d will list available roles to assign.';
    }

    public get delimiter() {
        return ';';
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const watchWorker = new SelfAssignRolesWatcherWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
        await watchWorker.Begin(commands);
    }
}