import { Client } from "discord.js";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { ChannelMessageSender } from "../../helpers/messageSenders/ChannelMessageSender";
import { Mongohelper } from "../../helpers/Mongohelper";
import { LiveDataStore } from "../../LiveDataStore";

export class ReplayCommandWorker {
    private _season: number;
    private _mongoHelper: Mongohelper;
    private _messageSender: ChannelMessageSender;
    
    public constructor(private client: Client<boolean>, private dataStore: DataStoreWrapper, private mongoConnectionUri: string) {
        this._season = +LiveDataStore.season;
        this._mongoHelper = new Mongohelper(this.mongoConnectionUri);
        this._messageSender = new ChannelMessageSender(this.client);
    }

    public async Run(): Promise<void> {
        
    }
}