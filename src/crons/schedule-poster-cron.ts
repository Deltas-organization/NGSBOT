import { inject, injectable } from "inversify";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { Client, GuildScheduledEventCreateOptions, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "discord.js";
import { TYPES } from "../inversify/types";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { LiveDataStore } from "../LiveDataStore";
import { NGSMongoHelper } from "../helpers/NGSMongoHelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DiscordGuilds } from "../enums/DiscordGuilds";
import { INGSSchedule } from "../interfaces";
import moment = require("moment");
import { ChannelMessageSender } from "../helpers/messageSenders/ChannelMessageSender";

@injectable()
export class SchedulePoster {
    private dataStore: DataStoreWrapper;
    private mongoHelper: NGSMongoHelper;

    constructor(
        @inject(TYPES.Client) private _client: Client,
        @inject(TYPES.Token) private _token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string
    ) {
        this.dataStore = new DataStoreWrapper(new LiveDataStore(apiToken));
        this.mongoHelper = new NGSMongoHelper(mongoConnection);
    }

    public async SendSchedule() {
        await this._client.login(this._token);
        const alreadySentMessageInformation = await this.mongoHelper.GetTodaysScheduleMessageInformation();
        const messageSender = new ChannelMessageSender(this._client);
        const games = await ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
        if (games.length > 0) {
            const messages = await ScheduleHelper.GetMessages(games);
            if (messages.length == 0)
                return;

            let messagesToSendTotalcount = 0;
            for (var index = 0; index < messages.length; index++) {
                messagesToSendTotalcount += (await messageSender.GetMessagesWithSafeLength(messages[index])).length;
            }

            if (alreadySentMessageInformation.length == 0) {
                let messageIndex = 0;
                for (var index = 0; index < messages.length; index++) {
                    const newMessageIds = await messageSender.SendToDiscordChannel(messages[index], DiscordChannels.NGSHype, true);
                    const messageInformation: { messageId: string, index: number }[] = [];
                    for (let messageId of newMessageIds) {
                        messageInformation.push({ messageId: messageId, index: messageIndex });
                        messageIndex++;
                    }
                    await this.mongoHelper.AddScheduleMessageIds(messageInformation);
                }
            }
            else if (alreadySentMessageInformation.length == messagesToSendTotalcount) {
                let messageIndex = 0;
                for (var index = 0; index < messages.length; index++) {
                    var existingMessageInformation = alreadySentMessageInformation.find(message => message.messageIndex == messageIndex);
                    if (existingMessageInformation != null) {
                        await messageSender.OverwriteMessage(messages[index], existingMessageInformation.messageId, DiscordChannels.NGSHype, true);
                    }
                    messageIndex++;
                }
            }
        }
    }

}