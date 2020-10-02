// import { ITranslate } from "../interfaces/ITranslator";
// import { Client } from "discord.js";
// import { TranslatorBase } from "./bases/translatorBase";
// import { INGSPlayer } from "../interfaces/INGSPlayer";
// import { stringify } from "querystring";
// import { MessageSender } from "../helpers/MessageSender";
// import { INGSFileResponse } from "../interfaces/INGSFileResponse";
// import { NGSDataStore } from "../NGSDataStore";
// import { Translationhelpers } from "../helpers/TranslationHelpers";
// export class NameChecker extends TranslatorBase {
//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client);
//     }
//     public get commandBangs(): string[] {
//         return ["name"];
//     }
//     public get description(): string {
//         return "Looks for players in teams, containing the provided value. Can search multiple with spaces between.";
//     }
//     protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         var message = "";
//         for (var i = 0; i < commands.length; i++) {
//             var playerName = commands[i];
//             var players = this.GetPlayers(playerName);
//             if (players.length <= 0)
//                 message += `No players found for: ${playerName} \n`;
//             else
//                 message += this.CreatePlayerMessage(players, detailed);
//             message += "\n";
//         }
//         await messageSender.SendMessage(message);
//     }
//     private CreatePlayerMessage(players: INGSPlayer[], detailed: boolean) {
//         let result = [];
//         players.forEach(p => {
//             let playerResult = '';
//             playerResult += `Name: ${Translationhelpers.GetPlayerUrl(p)}, \nDivision: ${p.Division}, \nTeamName: ${p.TeamName} \n`;
//             if (detailed) {
//                 playerResult += `DiscordTag: ${p.DetailedInformation.discordTag} \n`;
//                 playerResult += `Competitive Level: ${p.DetailedInformation.competitiveLevel} \n`;
//                 playerResult += `Roles Preferred: \n`;
//                 let roleInfo = p.DetailedInformation.role;
//                 let found = false;
//                 if (roleInfo) {
//                     if (roleInfo.tank) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Tank \n`;
//                     }
//                     if (roleInfo.meleeAssassin) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Melee Assassin \n`;
//                     }
//                     if (roleInfo.rangedAssassin) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Ranged Assassin \n`;
//                     }
//                     if (roleInfo.offlane) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Offlane \n`;
//                     }
//                     if (roleInfo.support) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Support \n`;
//                     }
//                     if (roleInfo.flex) {
//                         found = true;
//                         playerResult += `\u200B \u200B \u200B \u200B Flex \n`;
//                     }
//                 }
//                 if (!found) {
//                     playerResult += '\u200B \u200B \u200B \u200B No Role Information \n';
//                 }
//                 playerResult += `Seasons Played: ${p.DetailedInformation.seasonsPlayed} \n`;
//                 if (p.Pending) {
//                     playerResult += `--Pending \n`
//                 }
//             }
//             result.push(playerResult);
//         });
//         return result.join("\n");
//     }
//     private GetPlayers(playerName: string): INGSPlayer[] {
//         let lowerCase = playerName.toLowerCase();
//         return this.NGSDataStore.PlayerData.filter(p => p.Name.toLowerCase().includes(lowerCase));
//     }
// }
//# sourceMappingURL=nameChecker.js.map