import { Message, TextChannel, Client, Channel } from "discord.js";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "./TranslatorDependencies";

export class MessageSender {

    public get TextChannel() {
        return this.originalMessage.channel;
    }

    public get Requester() {
        return this.originalMessage.member.user;
    }

    constructor(private client: Client, public readonly originalMessage: Message, private messageStore: MessageStore) {

    }

    public async SendMessage(message: string, storeMessage = true) {
        var sentMessage = await this.TextChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
        if (storeMessage)
            this.messageStore.AddMessage(sentMessage);
        return sentMessage
    }

    public async SendFields(description: string, fields: { name: string, value: string }[]) {
        var sentMessage = await this.TextChannel.send({
            embed: {
                color: 0,
                description: description,
                fields: fields
            }
        });
        this.messageStore.AddMessage(sentMessage);
        return sentMessage;
    }

    public static async SendMessageToChannel(dependencies: TranslatorDependencies, message: string, channelID: string) {
        var myChannel = dependencies.client.channels.cache.find(channel => channel.id == channelID) as TextChannel;
        if (myChannel != null) {
            var sentMessage = await myChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            dependencies.messageStore.AddMessage(sentMessage);
            return sentMessage;
        }
    }
}