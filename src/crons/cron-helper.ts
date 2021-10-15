import { Client } from "discord.js";
import { inject, injectable } from "inversify";
import { CleanupFreeAgentsChannel } from "../commands/CleanupFreeAgentsChannel";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { SendChannelMessage } from "../helpers/SendChannelMessage";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { TYPES } from "../inversify/types";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { HistoryDisplay } from "../scheduled/HistoryDisplay";
import { ScheduleLister } from "../translators/ScheduleLister";

@injectable()
export class CronHelper { 
    private dataStore: DataStoreWrapper;
    private messageSender: SendChannelMessage;
    private historyDisplay: HistoryDisplay;
    private cleanupFreeAgentsChannel: CleanupFreeAgentsChannel;
    
    constructor(
        @inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private token: string,
        @inject(TYPES.ApiToken) apiToken: string
    ) {
        this.dataStore = new DataStoreWrapper(new LiveDataStore(apiToken));        
        this.messageSender = new SendChannelMessage(this.client, new MessageStore());
        this.historyDisplay = new HistoryDisplay(this.dataStore);
        this.cleanupFreeAgentsChannel = new CleanupFreeAgentsChannel(this.client);
    }

    public async sendSchedule() {
        await this.client.login(this.token);
        const games = await ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
        if (games.length > 1) {
            const messages = await ScheduleHelper.GetMessages(games);
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHype);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
            }
        }
    }

    public async sendScheduleForDad() {
        await this.sendScheduleByDivision(NGSDivisions.BSouthEast, DiscordChannels.DeltaServer);
    }

    public async sendScheduleForSis() {
        await this.sendScheduleByDivision(NGSDivisions.EEast, DiscordChannels.SisSchedule);
    }

    public async sendScheduleForMom() {
        await this.sendScheduleByDivision(NGSDivisions.BSouthEast, DiscordChannels.MomSchedule);
    }    

    public async sendScheduleByDivision(division: NGSDivisions, ...channels: DiscordChannels[]) {
        await this.client.login(this.token);
        let messages = await ScheduleHelper.GetTodaysGamesByDivision(this.dataStore, division);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                for (var channel of channels) {
                    await this.messageSender.SendMessageToChannel(messages[index], channel);
                }
            }
        }
    }
    
    public async CheckHistory() {
        await this.client.login(this.token);
        let messages = await this.historyDisplay.GetRecentHistory(1);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHistory);
            }
        }
    }
    
    public async DeleteOldMessages() {
        await this.client.login(this.token);
        try {
            await this.cleanupFreeAgentsChannel.NotifyUsersOfDelete(60);
            await this.cleanupFreeAgentsChannel.DeleteOldMessages(65);
        }
        catch (e) {
            Globals.log(e);
        }
    }
}