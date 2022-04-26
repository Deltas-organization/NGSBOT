import { MessageHelper } from "../helpers/MessageHelper";
import { MessageSender } from "../helpers/MessageSender";
import { AssignRolesWorker } from "../workers/AssignRolesWorker";
import { CleanupRoleWorker } from "../workers/CleanupRoleWorker";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { NonNGSTranslatorBase } from "./bases/nonNGSTranslatorBase";


export class CleanupTranslator extends DeltaTranslatorBase {
    public get commandBangs(): string[] {
        return ["cleanup"];
    }

    public get description(): string {
        return "Will Ask a series of questions on what you want to cleanup. Currently only delete empty roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        await messageSender.SendReactionMessage("Would you cleanup empty roles?",
            (user) => user == messageSender.GuildMember,
            async () => {
                var cleanupRoleWorker = new CleanupRoleWorker(this.translatorDependencies, detailed, messageSender);
                await cleanupRoleWorker.Begin(commands);
            })
    }
}