
import { Client, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { MessageStore } from "../MessageStore";

export class SendChannelMessage
{
    constructor(public client: Client, public messageStore: MessageStore)
    {

    }

    public async SendMessageToChannel(message: string, channelToSendTo: DiscordChannels): Promise<void>
    {
        var myChannel = this.client.channels.cache.find(channel => channel.id == channelToSendTo) as TextChannel;
        if (myChannel != null)
        {
            while (message.length > 2048)
            {
                let newMessage = message.slice(0, 2048);
                message = message.substr(2048);
                await this.SendMessage(myChannel, newMessage);
            }
            await this.SendMessage(myChannel, message);
        }
    }

    private async SendMessage(myChannel: TextChannel, message: string)
    {
        var sentMessage = await myChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
        this.messageStore.AddMessage(sentMessage);
        return sentMessage;
    }
}