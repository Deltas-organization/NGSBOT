// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
// import { MessageSender } from "../helpers/MessageSender";
// import { Client } from "discord.js";
// import { NGSDataStore } from "../NGSDataStore";
// import { TranslatorBase } from "./bases/translatorBase";
// import { Translationhelpers } from "../helpers/TranslationHelpers";

// var fs = require('fs');

// export class HistoryChecker extends TranslatorBase {

//     public get commandBangs(): string[] {
//         return ["history"];
//     }

//     public get description(): string {
//         return "Will display recent Changes to teams, supports a number of days back, defaults to 7. Or names of teams for entire history of a team.";
//     }

//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client);
//     }

//     protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         if (commands.length > 0) {
//             if (commands.length == 1) {
//                 let duration = parseInt(commands[0]);
//                 if (!isNaN(duration)) {
//                     await this.GetRecentChanges(messageSender, duration);
//                     return;
//                 }
//             }
//             if (commands.length == 2) {
//                 let duration = parseInt(commands[0]);
//                 if (!isNaN(duration)) {                    
//                     await this.GetDivisionhistory(messageSender, duration, commands[1]);
//                     return;
//                 }
//             }

//             this.GetIndividualHistory(commands, messageSender);
//         }
//         else {
//             await this.GetRecentChanges(messageSender, 7);
//         }

//     }

//     private GetIndividualHistory(commands: string[], messageSender: MessageSender) {
//         for (var i = 0; i < commands.length; i++) {
//             var searchTerm = commands[i].toLowerCase();
//             let allTeams = this.NGSDataStore.TeamData.filter(t => t.TeamName.toLowerCase().includes(searchTerm));
//             allTeams.forEach(async team => {
//                 let fields = [];
//                 let actions = [];
//                 let players = [];
//                 let dates = [];
//                 team.History.forEach(h => {
//                     let historyDate = new Date(h.timestamp);
//                     actions.push(h.action);
//                     players.push(h.target.split("#")[0]);
//                     dates.push(historyDate.toLocaleDateString('en-US'));
//                 });

//                 fields.push({ name: "Action", value: actions.join("\n"), inline: true });
//                 fields.push({ name: "Player", value: players.join("\n"), inline: true });
//                 fields.push({ name: "Date", value: dates.join("\n"), inline: true });

//                 await messageSender.SendFields(`Team: ${team.TeamName}`, fields);
//             });
//         }
//     }

//     private async GetRecentChanges(messageSender: MessageSender, duration: number) {
//         let allTeams = this.NGSDataStore.TeamData;
//         var todaysdate = new Date();
//         var todaysdateTime = Date.UTC(todaysdate.getFullYear(), todaysdate.getMonth(), todaysdate.getDate());
//         var result: TeamHistory[] = [];
//         allTeams.forEach(team => {
//             let teamHistory = new TeamHistory();
//             teamHistory.teamName = team.TeamName;
//             teamHistory.Division = team.DivisionDisplayName;
//             teamHistory.history = [];
//             team.History.forEach(h => {
//                 let historyDate = new Date(h.timestamp);
//                 let historyTime = Date.UTC(historyDate.getFullYear(), historyDate.getMonth(), historyDate.getDate());
//                 var ms = Math.abs(todaysdateTime - historyTime);
//                 let dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
//                 if (dayDifference <= duration) {
//                     let history = new History();
//                     history.Action = h.action;
//                     history.Player = h.target;
//                     history.Date = historyDate.toLocaleDateString('en-US');
//                     teamHistory.history.push(history)
//                 }
//             });
//             if (teamHistory.history.length > 0) {
//                 result.push(teamHistory);
//             }
//         });
//         result = result.sort((t1, t2) => (t1.Division > t2.Division) ? 1 : -1)
//         let beginningMessage = `Getting History for the last ${duration} days \n`;
//         let rollingMessage: string = beginningMessage;
//         for (var i = 0; i < result.length; i++) {
//             let currentResult = result[i];

//             let currentMessage = `**${currentResult.teamName}** \n`;
//             currentMessage += currentResult.Division + '\n';

//             currentResult.history.forEach(history => {
//                 currentMessage += `**${history.Action}**`;
//                 currentMessage += `\u0009 ${history.Player.split('#')[0]}`;
//                 currentMessage += `    ${history.Date} \n`;
//             });
//             currentMessage += '\n';

//             if (currentMessage.length + rollingMessage.length >= 2048) {
//                 await messageSender.SendMessage(rollingMessage);
//                 rollingMessage = beginningMessage + currentMessage;
//             }
//             else {
//                 rollingMessage += currentMessage;
//             }
//         }
//         await messageSender.SendMessage(rollingMessage);
//     }
    
//     private async GetDivisionhistory(messageSender: MessageSender, duration: number, divisionSearch: string) {
//         let allTeams = this.NGSDataStore.TeamData;
//         var todaysdate = new Date();
//         var todaysdateTime = Date.UTC(todaysdate.getFullYear(), todaysdate.getMonth(), todaysdate.getDate());
//         var result: TeamHistory[] = [];
//         allTeams.forEach(team => {
//             if(!team.DivisionDisplayName.toLowerCase().startsWith(divisionSearch))
//                 return;

//             let teamHistory = new TeamHistory();
//             teamHistory.teamName = team.TeamName;
//             teamHistory.Division = team.DivisionDisplayName;
//             teamHistory.history = [];
//             team.History.forEach(h => {
//                 let historyDate = new Date(h.timestamp);
//                 let historyTime = Date.UTC(historyDate.getFullYear(), historyDate.getMonth(), historyDate.getDate());
//                 var ms = Math.abs(todaysdateTime - historyTime);
//                 let dayDifference = Math.floor(ms / 1000 / 60 / 60 / 24);
//                 if (dayDifference <= duration) {
//                     let history = new History();
//                     history.Action = h.action;
//                     history.Player = h.target;
//                     history.Date = historyDate.toLocaleDateString('en-US');
//                     teamHistory.history.push(history)
//                 }
//             });
//             if (teamHistory.history.length > 0) {
//                 result.push(teamHistory);
//             }
//         });
//         result = result.sort((t1, t2) => (t1.Division > t2.Division) ? 1 : -1)
//         let beginningMessage = `Getting History for the last ${duration} days \n`;
//         let rollingMessage: string = beginningMessage;
//         for (var i = 0; i < result.length; i++) {
//             let currentResult = result[i];

//             let currentMessage = `**${currentResult.teamName}** \n`;
//             currentMessage += currentResult.Division + '\n';

//             currentResult.history.forEach(history => {
//                 currentMessage += `**${history.Action}**`;
//                 currentMessage += `\u0009 ${history.Player.split('#')[0]}`;
//                 currentMessage += `    ${history.Date} \n`;
//             });
//             currentMessage += '\n';

//             if (currentMessage.length + rollingMessage.length >= 2048) {
//                 await messageSender.SendMessage(rollingMessage);
//                 rollingMessage = beginningMessage + currentMessage;
//             }
//             else {
//                 rollingMessage += currentMessage;
//             }
//         }
//         await messageSender.SendMessage(rollingMessage);
//     }
// }

// class TeamHistory {
//     public teamName: string;
//     public Division: string;
//     public history: History[];
// }

// class History {
//     public Action: string;
//     public Player: string;
//     public Date: string;
// }