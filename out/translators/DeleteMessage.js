// import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
// import { CommandDependencies } from "../helpers/TranslatorDependencies";
// import { DeleteMessageWorker } from "../workers/DeleteMessageWorker";
// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
// export class DeleteMessage extends AdminTranslatorBase {
//     public get commandBangs(): string[] {
//         return ["delete", "del"];
//     }
//     public get description(): string {
//         return "Will delete the last message sent by the bot on this server";
//     }
//     constructor(translatorDependencies: CommandDependencies) {
//         super(translatorDependencies);
//     }
//     protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
//         const worker = new DeleteMessageWorker(this.translatorDependencies, detailed, messageSender);
//         await worker.Begin(commands);
//     }
// }
//# sourceMappingURL=DeleteMessage.js.map