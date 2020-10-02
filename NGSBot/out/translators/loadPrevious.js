// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
// import { MessageSender } from "../helpers/MessageSender";
// import { NGSDataStore } from "../NGSDataStore";
// import { Client } from "discord.js";
// import { execFile } from "child_process";
// import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
// export class LoadPrevious extends DeltaTranslatorBase {
//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client)
//     }
//     public get commandBangs(): string[] {
//         return ["load"];
//     }
//     public get description(): string {
//         return "Loads the previously created NGS Information to the Bot, accepts: current, previous. Allows a number for amount to go back. \n Requires Delta";
//     }
//     protected Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         if (detailed) {
//             this.ReturnVersionList(messageSender);
//             return;
//         }
//         let command = commands[0].toLowerCase();
//         let index = 0;
//         if (commands.length == 2) {
//             let parsedValue = parseInt(commands[1])
//             if (isNaN(parsedValue)) {
//                 messageSender.SendMessage(`Unknown number: ${commands[1]}`);
//             }
//             else {
//                 index = parsedValue;
//             }
//         }
//         if (command == "current")
//             this.NGSDataStore.ReloadData();
//         else if (command == "previous")
//             this.NGSDataStore.LoadPrevious(index);
//         else
//             messageSender.SendMessage(`Unknown Parameter: ${command}`);
//         messageSender.SendMessage(`Loaded Version: ${this.NGSDataStore.GetVersionFriendlyName()}`);
//     }
//     private ReturnVersionList(messageSender: MessageSender) {
//         var message = "Available Versions: \n";
//         var dataList = this.NGSDataStore.Data.LastFileNames;
//         for (var i = 0; i < dataList.length; i++) {
//             message += `\t ${dataList[i]} \n`;
//         }
//         messageSender.SendMessage(message);
//     }
// }
//# sourceMappingURL=loadPrevious.js.map