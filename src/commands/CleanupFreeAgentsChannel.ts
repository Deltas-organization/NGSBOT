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

    public async NotifyUsersOfDelete(exactDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.NGSFreeAgents);
        const messagesToDelete: MessageDeleteContainer[] = await this.GetMessagesOlderThen(exactDayCount - 1, guildChannel);
        if (messagesToDelete.length <= 0)
            return;

        Globals.log("notifying users of messages about to be deleted");
        for (let container of messagesToDelete) {
            try {
                const message = container.Message;
                if(container.DaysOld != exactDayCount)
                    continue;
                if (!message.author) {
                    continue;
                }
                if (!message.deletable)
                    continue;
                await message.author.send({
                    embed: {
                        color: 0,
                        description: "In 5 days your free agent posting on the NGS Discord Server will be deleted, you will need to repost it if you are still looking for a team. \n \n If you have any questions or concerns please bring them up in the discord you can mention DeltaSniper in the comment.  \n \n **I cannot read, relay, or reply to any message you send to me in this chat.**"
                    }
                });
            }
            catch (e) {
                Globals.log("there was a problem notifying user about a message being deleted soon", e);
            }
        }
    }

    public async DeleteOldMessages(pastDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.NGSFreeAgents);
        const messagesToDelete: MessageDeleteContainer[] = await this.GetMessagesOlderThen(pastDayCount - 1, guildChannel);
        if (messagesToDelete.length <= 0)
            return;

        Globals.log("deleteing old free agent messages");
        for (var message of messagesToDelete.map(m => m.Message)) {
            try {
                if (!message.deletable) {
                    Globals.log("unable to delete message.");
                    continue;
                }
                await message.author.send({
                    embed: {
                        color: 0,
                        description: "Your free agent posting is being deleted for being older then 65 days. Here is the original message. \n \n If you have any questions or concerns please bring them up in the discord you can mention DeltaSniper in the comment.  \n \n **I cannot read, relay, or reply to any message you send to me in this chat.**"
                    }
                });
                await message.author.send({
                    embed: {
                        color: 0,
                        description: message.content
                    }
                });
                await message.delete();
            }
            catch (e) {
                Globals.log("there was a problem deleting a message", e);
            }
        }
    }

    private async GetMessagesOlderThen(pastDayCount: number, guildChannel: TextChannel): Promise<MessageDeleteContainer[]> {
        let fetchLimit = 100;
        let messages = (await guildChannel.messages.fetch({ limit: fetchLimit })).map((message, _, __) => message);

        let messagesToDelete = this.GetMessageOlderThen(pastDayCount, messages);
        while (messages.length > 0) {
            messages = (await guildChannel.messages.fetch({ limit: fetchLimit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
            messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastDayCount, messages));
        }

        return messagesToDelete;
    }

    private GetMessageOlderThen(days: number, messages: Message[]): MessageDeleteContainer[] {
        const currentDate = moment();
        let messagesToDelete: MessageDeleteContainer[] = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            const dateDifference = currentDate.diff(momentDate, 'days');
            if (dateDifference > days) {
                if (!message.pinned) {
                    messagesToDelete.push(new MessageDeleteContainer(message, dateDifference));
                }
            }
        }
        return messagesToDelete;
    }

    private async GetChannel(channelId: string) {
        return (await this.client.channels.fetch(channelId, false)) as TextChannel;
    }

}

class MessageDeleteContainer {
    constructor(public Message: Message, public DaysOld: number) {
    }
}
