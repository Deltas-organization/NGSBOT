import { Message, TextChannel, Client, Channel, GuildMember, User, NewsChannel, DMChannel, MessageAttachment, BufferResolvable, FileOptions } from "discord.js";
import { Stream } from "stream";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { MessageContainer } from "../../message-helpers/MessageContainer";
import { MessageStore } from "../../MessageStore";
import { MessageWrapper } from "../MessageWrapper";
import { CommandDependencies } from "../TranslatorDependencies";

export class MessageSender {
    private maxLength = 2000;

    constructor(protected client: Client,
        protected messageStore: MessageStore) {

    }

    public async SendBasicMessageToChannel(message: string, channel: TextChannel | DMChannel | NewsChannel): Promise<Message[]> {
        var messagesSent: Message[] = [];
        while (message.length > this.maxLength) {
            let newMessage = message.slice(0, this.maxLength);
            message = message.substr(this.maxLength);
            var result = await this.SendBasicMessageToChannel(newMessage, channel);
            messagesSent.push(...result);
        }
        var sentMessage = await this.JustSendIt(message, channel, true);
        messagesSent.push(sentMessage);
        return messagesSent;
    }

    public async SendMessageToChannel(message: string, channel: TextChannel | DMChannel | NewsChannel, storeMessage = true) {
        while (message.length > this.maxLength) {
            let newMessage = message.slice(0, this.maxLength);
            message = message.substr(this.maxLength);
            await this.SendMessageToChannel(newMessage, channel, storeMessage);
        }
        var sentMessage = await this.JustSendIt(message, channel, false);

        if (storeMessage)
            this.messageStore.AddMessage(sentMessage);

        return new MessageWrapper(this, sentMessage);
    }

    public async SendMessagesToChannel(messages: string[], channel: TextChannel | DMChannel | NewsChannel, storeMessage = true) {
        let result: MessageWrapper[] = [];
        let combinedMessages = this.CombineMultiple(messages);
        for (var message of combinedMessages) {
            result.push(await this.SendMessageToChannel(message, channel, storeMessage));
        }
        return result;
    }

    public async Edit(message: Message, newContent: string) {
        return await message.edit({
            embed: {
                color: 0,
                description: newContent
            }
        });
    }


    public static async SendMessageToChannel(dependencies: CommandDependencies, message: string, channelID: string) {
        var sentMessage = await this.SendMessageToChannelThroughClient(dependencies.client, message, channelID);
        if (sentMessage)
            dependencies.messageStore.AddMessage(sentMessage);
    }

    public static async SendMessageToChannelThroughClient(client: Client, message: string, channelID: string) {
        var myChannel = client.channels.cache.find(channel => channel.id == channelID) as TextChannel;
        if (myChannel != null) {
            var sentMessage = await myChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            return sentMessage;
        }
    }

    public async SendMessageFromContainerToChannel(container: MessageContainer, channel: TextChannel | DMChannel | NewsChannel, basicMessage = false, storeMessage = true) {
        var messages = container.MultiMessages(this.maxLength);
        for (var message of messages) {
            var sentMessage = await this.JustSendIt(message, channel, basicMessage);

            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
        }
    }

    private async JustSendIt(message: string, channel: TextChannel | DMChannel | NewsChannel, basic: boolean) {
        if (basic)
            return await channel.send(message);

        return await channel.send({
            embed: {
                color: 0,
                description: message
            }
        });

    }

    private CombineMultiple(messages: string[]): string[] {
        let result: string[] = [];
        let currentMessage = '';
        for (var message of messages) {
            if (currentMessage.length + message.length > this.maxLength) {
                result.push(currentMessage);
                currentMessage = '';
            }
            currentMessage += message;
        }
        result.push(currentMessage);
        return result;
    }
}
