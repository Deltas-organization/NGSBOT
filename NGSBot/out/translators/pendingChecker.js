// import { ITranslate } from "../interfaces/ITranslator";
// import { Client } from "discord.js";
// import { TranslatorBase } from "./bases/translatorBase";
// import { INGSPlayer } from "../interfaces/INGSPlayer";
// import { stringify } from "querystring";
// import { MessageSender } from "../helpers/MessageSender";
// import { INGSFileResponse } from "../interfaces/INGSFileResponse";
// var fs = require('fs');
// export class PendingChecker extends TranslatorBase {
//     private _playerList: INGSPlayer[]
//     public get commandBangs(): string[] {
//         return ["pending"];
//     }
//     public get description(): string {
//         return "Looks for pending players who are awaiting approval by mods.";
//     }
//     protected Init() {
//         this._playerList = this.LoadData().Players.map(p => {
//             return p;
//         });
//     }
//     private LoadData(): INGSFileResponse {
//         let rawdata = fs.readFileSync('C:/Data/NGSPlayers.json');
//         return JSON.parse(rawdata);
//     }
//     protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         var message = "";
//         var players = this.GetPlayers();
//         if (players.length <= 0)
//             message += `No players are pending: \n`;
//         else
//             message += this.CreatePlayerMessage(players);
//         message += "\n";
//         await messageSender.SendMessage(message);
//     }
//     private CreatePlayerMessage(players: INGSPlayer[]) {
//         let result = [];
//         players.forEach(p => {
//             let playerResult = '';
//             playerResult += `Name: [${p.Name}](${p.ProfileURL}), \nDivision: ${p.Division}, \nTeamName: ${p.TeamName} \n`;
//             if (p.Pending) {
//                 playerResult += `--Pending \n`
//             }
//             result.push(playerResult);
//         });
//         return result.join("\n");
//     }
//     private GetPlayers(): INGSPlayer[] {
//         return this._playerList.filter(p => p.Pending);
//     }
// }
//# sourceMappingURL=pendingChecker.js.map