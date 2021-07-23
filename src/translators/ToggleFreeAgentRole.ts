import { MessageSender } from "../helpers/MessageSender";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { AssignRolesWorker } from "../workers/AssignRolesWorker";
import { AssignFreeAgentRoleWorker } from "../workers/AssignFreeAgentRoleWorker";

export class ToggleFreeAgentRole extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["assign", "unassign"];
    }

    public get description(): string {
        return "Will assign or unassign free agent role";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        if (commands[0].toLowerCase().startsWith("free")) {
            const assignRolesWorker = new AssignFreeAgentRoleWorker(this.translatorDependencies, detailed, messageSender);
            await assignRolesWorker.Begin(commands);
        }
    }
}