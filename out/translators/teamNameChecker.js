// import { ITranslate } from "../interfaces/ITranslator";
// import { Client, Message } from "discord.js";
// import { TranslatorBase } from "./bases/translatorBase";
// import { INGSPlayer } from "../interfaces/INGSPlayer";
// import { stringify } from "querystring";
// import { INGSTeam } from "../interfaces/INGSTeam";
// import { MessageSender } from "../helpers/MessageSender";
// import { INGSFileResponse } from "../interfaces/INGSFileResponse";
// import { NGSDataStore } from '../NGSDataStore';
// import { Translationhelpers } from "../helpers/TranslationHelpers";
// var fs = require('fs');
// export class TeamNameChecker extends TranslatorBase {
//     public get commandBangs(): string[] {
//         return ["team"];
//     }
//     public get description(): string {
//         return "Will List Teams contianing the values, Supports multiple searches with the space delimeter. And can include spaces by wraping the search in double quotes.";
//     }
//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client);
//     }
//     protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
//         for (var i = 0; i < commands.length; i++) {
//             let fields = [];
//             var searchTerm = commands[i];
//             var teams = this.GetTeams(searchTerm);
//             if (teams.length <= 0) {
//                 fields.push({ name: `No teams found for  \n`, value: searchTerm });
//                 await message.SendFields(``, fields);
//             }
//             else {
//                 teams.forEach(async t => {
//                     let teamMessage = this.GetTeamMessage(t);
//                     await message.SendFields(``, teamMessage);
//                 });
//             }
//         }
//     }
//     private GetTeams(searchTerm: string): INGSTeam[] {
//         let searchTermLowerCase = searchTerm.toLowerCase();
//         let allPlayers = this.NGSDataStore.PlayerData.filter(p => p.TeamName.toLowerCase().includes(searchTermLowerCase));
//         let uniqueTeamNames = [...new Set(allPlayers.map(p => p.TeamName))];
//         let result: INGSTeam[] = [];
//         for (var i = 0; i < uniqueTeamNames.length; i++) {
//             let teamName: string = uniqueTeamNames[i];
//             let team = { TeamName: teamName, Players: [], Description: '-', CompetitiveLevel: '-', History: [], DivisionDisplayName: 'Unknown' };
//             team.Players = this.NGSDataStore.PlayerData.filter(p => p.TeamName == teamName)
//             let ngsTeam = this.NGSDataStore.TeamData.filter(t => t.TeamName == teamName)
//             team.Description = ngsTeam[0].Description;
//             team.CompetitiveLevel = ngsTeam[0].CompetitiveLevel;
//             team.DivisionDisplayName = ngsTeam[0].DivisionDisplayName;
//             result.push(team);
//         }
//         return result;
//     }
//     private GetTeamMessage(team: INGSTeam): any[] {
//         let result = [];
//         result.push({ name: "TeamName", value: `\u0009 ${Translationhelpers.GetTeamURL(team.TeamName)}`, inline: true });
//         result.push({ name: "Division", value: `\u0009 ${team.DivisionDisplayName}`, inline: true });
//         result.push({ name: "Description", value: `\u0009 ${team.Description} -`, inline: true });
//         let firstValueArray = [];
//         let secondValueArray = [];
//         let thirdValueArray = [];
//         let playerLength = team.Players.length;
//         for (var i = 0; i < playerLength; i += 3) {
//             let player = team.Players[i];
//             firstValueArray.push('\u0009' + Translationhelpers.GetPlayerUrl(player));
//             if (i + 1 < playerLength) {
//                 player = team.Players[i + 1];
//                 secondValueArray.push('\u0009' + Translationhelpers.GetPlayerUrl(player));
//             }
//             if (i + 2 < playerLength) {
//                 player = team.Players[i + 2];
//                 thirdValueArray.push('\u0009' + Translationhelpers.GetPlayerUrl(player));
//             }
//         }
//         result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
//         result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
//         result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
//         return result;
//     }
// }
//# sourceMappingURL=teamNameChecker.js.map