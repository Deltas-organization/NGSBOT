// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
// import { MessageSender } from "../helpers/MessageSender";
// import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
// import { Client, Message } from "discord.js";
// import { NGSDataStore } from "../NGSDataStore";
// import { NGSScheduleDataStore } from "../NGSScheduleDataStore";

// var fs = require('fs');

// export class ReloadList extends DeltaTranslatorBase {

//     private _lastSender: MessageSender;
//     private _teamCompleteLocation = 'C:/Reload/ReloadTeamCompleted.json';
//     private _scheduleCompleteLocation = 'C:/Reload/ReloadScheduleCompleted.json';


//     public get commandBangs(): string[] {
//         return ["reload"];
//     }

//     public get description(): string {
//         return "Will RePull new information from the NGS WebSite. \n Requires Delta";
//     }

//     constructor(client: Client, private NGSDataStore: NGSDataStore, private NGSScheduleDataStore: NGSScheduleDataStore) {
//         super(client);
//     }

//     protected Init() {
//         fs.watch('C:/Reload', "utf8", (event, trigger) => {
//             if (fs.existsSync(this._teamCompleteLocation)) {
//                 this.NGSDataStore.ReloadData();

//                 if (this._lastSender) {
//                     this._lastSender.SendMessage("Reload Team Completed");
//                 }
//             }
//             if (fs.existsSync(this._scheduleCompleteLocation)) {
//                 this.NGSScheduleDataStore.ReloadData();

//                 if (this._lastSender) {
//                     this._lastSender.SendMessage("Reload Schedule Completed");
//                 }
//             }
//         });
//     }

//     protected Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         if (commands.length == 1 && commands[0].toLowerCase() == "s") {
//             this.ReloadScheduleInformation(messageSender);
//         }
//         else {
//             this.ReloadInformation(messageSender);
//         }
//     }
    
//     private ReloadScheduleInformation(messageSender: MessageSender)
//     {        
//         fs.unlink(this._scheduleCompleteLocation, (err) => {
//             if (err)
//                 console.log(err);
//         });
//         fs.writeFile('C:/Reload/ReloadSchedule.json', 'Hello Node.js', 'utf8', () => {

//         });
//         this._lastSender = messageSender;
//         messageSender.SendMessage("NGS Schedule Information is being reloaded...");
//     }

//     private async ReloadInformation(messageSender: MessageSender)
//     {        
//         fs.unlink(this._teamCompleteLocation, (err) => {
//             if (err)
//                 console.log(err);
//         });
//         fs.writeFile('C:/Reload/Reload.json', 'Hello Node.js', 'utf8', () => {

//         });
//         this._lastSender = messageSender;
//         messageSender.SendMessage("NGS Information is being reloaded...");
//         this.ReloadScheduleInformation(messageSender);
//     }
// }