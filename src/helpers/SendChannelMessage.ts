
import { Client, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { MessageStore } from "../MessageStore";

export class SendChannelMessage
{
    constructor(public client: Client, public messageStore: MessageStore)
    {

    }

    public async SendMessageToChannel(message: string, channelToSendTo: DiscordChannels) {
        var myChannel = this.client.channels.cache.find(channel => channel.id == channelToSendTo) as TextChannel;
        if (myChannel != null) {
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
}