import { Client, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import moment = require("moment-timezone");
import { Globals } from "../Globals";
import { MessageSender } from "../helpers/messageSenders/MessageSender";

export class CleanupLFGChannel {
    constructor(private client: Client) {
    }

    public async DeleteOldMessages(pastHourCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.NGSLFG);
        const messagesToDelete: MessageDeleteContainer[] = await this.GetMessagesOlderThen(pastHourCount - 1, guildChannel);
        if (messagesToDelete.length <= 0)
            return;

        Globals.log("deleteing old LFG messages");
        for (var message of messagesToDelete.map(m => m.Message)) {
            try {
                if (!message.deletable) {
                    Globals.log("unable to delete message.");
                    continue;
                }
               
                await message.delete();
            }
            catch (e) {
                MessageSender.SendMessageToChannelThroughClient(this.client, "There was a problem deleting a message.", DiscordChannels.DeltaPmChannel);
                MessageSender.SendMessageToChannelThroughClient(this.client, e, DiscordChannels.DeltaPmChannel);
            }
        }
    }

    private async GetMessagesOlderThen(pastHourCount: number, guildChannel: TextChannel): Promise<MessageDeleteContainer[]> {
        let fetchLimit = 100;
        let messages = (await guildChannel.messages.fetch({ limit: fetchLimit })).map((message, _, __) => message);

        let messagesToDelete = this.GetMessageOlderThen(pastHourCount, messages);
        while (messages.length > 0) {
            messages = (await guildChannel.messages.fetch({ limit: fetchLimit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
            messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastHourCount, messages));
        }

        return messagesToDelete;
    }

    private GetMessageOlderThen(hours: number, messages: Message[]): MessageDeleteContainer[] {
        const currentDate = moment();
        let messagesToDelete: MessageDeleteContainer[] = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            const dateDifference = currentDate.diff(momentDate, 'hours');
            if (dateDifference > hours) {
                if (!message.pinned) {
                    messagesToDelete.push(new MessageDeleteContainer(message, dateDifference));
                }
            }
        }
        return messagesToDelete;
    }

    private async GetChannel(channelId: string) {
        return (await this.client.channels.fetch(channelId)) as TextChannel;
    }

}

class MessageDeleteContainer {
    constructor(public Message: Message, public DaysOld: number) {
    }
}
