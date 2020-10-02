// import { MessageSender } from "../helpers/MessageSender";
// import { Client } from "discord.js";
// import { execFile } from "child_process";
// import { ITranslate } from "../interfaces/ITranslator";
// import { TranslatorBase } from "./bases/translatorBase";
// import { NGSDataStore } from "../NGSDataStore";
// import { INGSDivision } from "../interfaces/INGSDivision";
// export class DivisionLister extends TranslatorBase {
//     public get commandBangs(): string[] {
//         return ["divisions", "divs", "div"];
//     }
//     public get description(): string {
//         return "Lists the Divisions And Teams";
//     }
//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client);
//     }
//     protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         if (commands.length == 0) {
//             await this.SendAllDivisions(messageSender);
//         }
//         for (var i = 0; i < commands.length; i++) {
//             let fields = [];
//             var searchTerm = commands[i];
//             await this.SendSearchedDivisions(searchTerm, messageSender);
//         }
//     }
//     private SendAllDivisions(messageSender: MessageSender) {
//         var sortedDivisions = this.SortDivisions();
//         sortedDivisions.forEach(async d => {
//             await this.SendMessage(d, messageSender);
//         })
//     }
//     private async SendSearchedDivisions(searchTerm: string, messageSender: MessageSender) {
//         var sortedDivisions = this.SortDivisions();
//         var filteredDivisions = sortedDivisions.filter(sd => sd.displayName.toLowerCase().startsWith(searchTerm.toLowerCase()));
//         filteredDivisions.forEach(async fd => {
//             await this.SendMessage(fd, messageSender);
//         });
//     }
//     private async SendMessage(division: INGSDivision, messageSender: MessageSender) {
//         var message = division.displayName + '\n';
//         message += `**MOD:** ${division.moderator} \n \n`
//         message += division.teams.join('\n');
//         await messageSender.SendMessage(message);
//     }
//     private SortDivisions() {
//         return this.NGSDataStore.DivisionData.sort((d1, d2) => d1.displayName < d2.displayName ? -1 : 1);
//     }
// }
//# sourceMappingURL=divisionLister.js.map