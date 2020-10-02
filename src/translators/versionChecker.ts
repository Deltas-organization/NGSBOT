// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
// import { MessageSender } from "../helpers/MessageSender";
// import { INGSFileResponse } from "../interfaces/INGSFileResponse";
// import { TranslatorBase } from "./bases/translatorBase";
// import { NGSDataStore } from "../NGSDataStore";
// import { Client } from "discord.js";

// var fs = require('fs');

// export class VersionChecker extends TranslatorBase {


//     public get commandBangs(): string[] {
//         return ["version"];
//     }

//     public get description(): string {
//         return "Lists the version of data the bot it currently reading from when querying NGS information";
//     }

//     constructor(client: Client, private NGSDataStore: NGSDataStore) {
//         super(client);

//     }

//     protected Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         messageSender.SendMessage(`Current data was downloaded on: ${this.NGSDataStore.GetVersionFriendlyName()}`);
//     }
// }