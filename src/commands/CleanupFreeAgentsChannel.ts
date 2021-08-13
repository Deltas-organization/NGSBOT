import { Client, GuildChannel, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import moment = require("moment-timezone");
import { Globals } from "../Globals";
import { CLIENT_RENEG_LIMIT } from "tls";
import { DiscordMembers } from "../enums/DiscordMembers";

export class CleanupFreeAgentsChannel {
    private client: Client;
    private dataStore: DataStoreWrapper;

    constructor(dependencies: CommandDependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }

    public async NotifyUsersOfDelete(pastDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.DeltaServer);
        let messagesToDelete: Message[] = await this.GetMessagesOlderThen(pastDayCount, guildChannel);
        for (var message of messagesToDelete) {
            if(message.member.id != DiscordMembers.Delta)
                continue;

            await message.member.send({
                embed: {
                    color: 0,
                    description: "In 5 days your free agent posting on the website will be deleted, you will need to repost it. Here is the original message: "
                }
            });
            await message.member.send({
                embed: {
                    color: 0,
                    description: message.content
                }
            });
            break;
        }
    }

    public async DeleteOldMessages(pastDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.NGSFreeAgents);
        let messagesToDelete: Message[] = await this.GetMessagesOlderThen(pastDayCount, guildChannel);
        console.log(messagesToDelete.length);
        // for(var message of messagesToDelete)
        // {
        //     console.log("deleting");
        //     await message.delete();
        // }
    }

    private async GetMessagesOlderThen(pastDayCount: number, guildChannel: TextChannel) {
        let fetchLimit = 100;
        let messages = (await guildChannel.messages.fetch({ limit: fetchLimit })).map((message, _, __) => message);

        let messagesToDelete = this.GetMessageOlderThen(pastDayCount, messages);
        while (messages.length > 0) {
            messages = (await guildChannel.messages.fetch({ limit: fetchLimit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
            messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastDayCount, messages));
            if(messagesToDelete.length >= 100)
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
