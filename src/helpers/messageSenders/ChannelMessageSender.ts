import { Client, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { MessageContainer } from "../../message-helpers/MessageContainer";
import { MessageStore } from "../../MessageStore";
import { MessageSender } from "./MessageSender";

export class ChannelMessageSender extends MessageSender {
    constructor(client: Client) {
        super(client)
    }

    public async SendToDiscordChannel(message: string, channel: DiscordChannels | string) {
        try {
            const myChannel = await this.FindChannel(channel);
            return await this.SendMessageToChannel(message, myChannel)
        }
        catch (e) {
            console.log(e);
        }
    }

    public async SendToDiscordChannelAsBasic(message: string, channel: DiscordChannels | string): Promise<Message[]> {
        const myChannel = await this.FindChannel(channel);
        return await this.SendBasicMessageToChannel(message, myChannel);
    }

    public async SendFromContainerToDiscordChannel(container: MessageContainer, channel: DiscordChannels | string, basic = false) {
        const myChannel = await this.FindChannel(channel);
        return await this.SendMessageFromContainerToChannel(container, myChannel, basic);
    }

    public async OverwriteBasicMessage(newMessageText: string, messageId: string, messageChannel: DiscordChannels) {
        const myChannel = await this.client.channels.fetch(messageChannel) as TextChannel;
        const message = await myChannel.messages.fetch(messageId);
        await message.edit(newMessageText);
    }

    private async FindChannel(channel: DiscordChannels | string) {
        return await this.client.channels.fetch(channel) as TextChannel;
    }
}