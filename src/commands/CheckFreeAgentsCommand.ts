import { Client, GuildChannel, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import moment = require("moment-timezone");
import { Globals } from "../Globals";
import { CLIENT_RENEG_LIMIT } from "tls";

export class CheckFreeAgentsCommand {
    private client: Client;
    private dataStore: DataStoreWrapper;

    constructor(dependencies: CommandDependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }

    public async DeleteOldMessages(pastDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.DeltaServer);
        let messagesToDelete: Message[] = await this.GetMessagesToDelete(pastDayCount, guildChannel);
        for(var message of messagesToDelete)
        {
            console.log("deleting");
            await message.delete();
        }
        // while (messagesToDelete.length == 100) {
        //     try {
        //         await guildChannel.bulkDelete(messagesToDelete);
        //     }
        //     catch (e) {
        //         Globals.log(e);
        //     }
        //     messagesToDelete = await this.GetMessagesToDelete(pastDayCount, guildChannel);
        // }
    }

    private async GetMessagesToDelete(pastDayCount: number, guildChannel: TextChannel) {
        let limit = 100;
        let messages = (await guildChannel.messages.fetch({ limit })).map((message, _, __) => message);

        let messagesToDelete = this.GetMessageOlderThen(pastDayCount, messages);
        while (messagesToDelete.length < limit) {
            messages = (await guildChannel.messages.fetch({ limit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
            messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastDayCount, messages));
            if (messages.length < limit)
                break;
        }

        return messagesToDelete;
    }

    private GetMessageOlderThen(days: number, messages: Message[]) {
        const currentDate = moment();
        let messagesToDelete: Message[] = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            const dateDifference = currentDate.diff(momentDate, 'days');
            if (dateDifference > days) {
                if (!message.pinned) {
                    messagesToDelete.push(message);
                }
            }
        }
        return messagesToDelete;
    }

    private async GetChannel(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId, false)) as TextChannel;
        return channel;
    }
}
