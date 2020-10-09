import { Message, TextChannel, Client, Channel } from "discord.js";

export class MessageSender {

    public get TextChannel() {
        return this.originalMessage.channel;
    }

    constructor(private client: Client, public readonly originalMessage: Message) {

    }

    public async SendMessage(message: string) {
        await this.TextChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
    }

    public async SendFields(description: string, fields: { name: string, value: string }[]) {
        await this.TextChannel.send({
            embed: {
                color: 0,
                description: description,
                fields: fields
            }
        });
    }

    public async SendMessageToChannel(message: string, channelID: string) {
        var myChannel = this.originalMessage.guild.channels.cache.find(channel => channel.id == channelID) as TextChannel;
        await myChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
    }

    public static async SendMessageToChannel(client: Client, message: string, channelID: string) {
        var myChannel = client.channels.cache.find(channel => channel.id == channelID) as TextChannel;
        if (myChannel != null) {
            await myChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
        }
    }
}