import { MessageSender } from "../../helpers/MessageSender";
import { SelfAssignRolesCreatorWorker } from "../../workers/Mongo/SelfAssignRolesCreatorWorker";
import { AdminTranslatorBase } from "../bases/adminTranslatorBase";

export class SelfAssignRolesCreator extends AdminTranslatorBase {
    public get commandBangs(): string[] {
        return ["self"];
    }

    public get description(): string {
        return "Will register which roles can be self assigned for your discord. Detailed (-d) will list the current roles that can be self assigned.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const watchWorker = new SelfAssignRolesCreatorWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
        await watchWorker.Begin(commands);
    }
}