import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./inversify/types";
import { ITranslate } from "./interfaces/ITranslator";
import { NGSDataStore } from "./NGSDataStore";
import { NGSScheduleDataStore } from "./NGSScheduleDataStore";
import { ScheduleLister } from "./translators/ScheduleLister";
import { StandingsLister } from "./translators/StandingsLister";
import { CommandLister } from "./translators/commandLister";

var fs = require('fs');

@injectable()
export class Bot {
    private translators: ITranslate[] = [];

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
        @inject(TYPES.NGSDataStore) public NGSDataStore: NGSDataStore,
        @inject(TYPES.NGSScheduleDataStore) public NGSScheduleDataStore: NGSScheduleDataStore
    ) {
        // this.translators.push(new NameChecker(client, NGSDataStore));
        // this.translators.push(new TeamNameChecker(client, NGSDataStore));
        // this.translators.push(new VersionChecker(client, NGSDataStore));
        // this.translators.push(new PendingChecker(client));
        // this.translators.push(new HistoryChecker(client, NGSDataStore));
        // this.translators.push(new DivisionLister(client, NGSDataStore));
        this.translators.push(new ScheduleLister(client, NGSScheduleDataStore));
        // this.translators.push(new StandingsLister(client));

        this.translators.push(new CommandLister(client, this.translators));
    }

    public listen(): Promise<string> {
        this.client.on('message', async (message: Message) => {
            this.OnMessageReceived(message);
        });

        return this.client.login(this.token);
    }

    public OnMessageReceived(message: Message) {
        let originalContent = message.content;
        if (/^\>/.test(originalContent)) {
            var trimmedValue = originalContent.substr(1);
            this.translators.forEach(translator => {
                translator.Translate(trimmedValue, message);
            });
        }
    }
}