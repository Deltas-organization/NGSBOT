import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { AssignFreeAgentRoleWorker } from "../workers/AssignFreeAgentRoleWorker";
import { NGSOnlyTranslatorBase } from "./bases/ngsOnlyTranslatorBase";

export class ToggleFreeAgentRole extends NGSOnlyTranslatorBase {
    public get commandBangs(): string[] {
        return ["assign", "unassign"];
    }

    public get description(): string {
        return "Will assign or unassign free agent role";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        if (commands.length <= 0)
            return;

        if (commands[0].toLowerCase().startsWith("free")) {
            const assignRolesWorker = new AssignFreeAgentRoleWorker(this.translatorDependencies, detailed, messageSender);
            await assignRolesWorker.Begin(commands);
        }
    }
}