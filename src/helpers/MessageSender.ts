import { Message, TextChannel, Client, Channel, GuildMember, User } from "discord.js";
import { Globals } from "../Globals";
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

    public async SendReactionMessage(message: string, authentication: (member: GuildMember) => boolean, yesReaction: () => Promise<any> | any, noReaction: () => Promise<any> | any = () => {}, storeMessage = true) {
        var sentMessage = await this.TextChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
        if (storeMessage)
            this.messageStore.AddMessage(sentMessage);

        await sentMessage.react('✅');
        await sentMessage.react('❌');
        await sentMessage.react('🛑');
        const members = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        const filter = (reaction, user: User) => {
            let member = members.find(mem => mem.id == user.id);
            return ['✅', '❌','🛑'].includes(reaction.emoji.name) && authentication(member);
        };
        let response = null;
        try {
            var collectedReactions = await sentMessage.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
            if (collectedReactions.first().emoji.name === '✅') {
                await yesReaction();
                response = true;
            }
            if (collectedReactions.first().emoji.name === '❌') {
                await noReaction();
                response = false;
            }
            
            if (collectedReactions.first().emoji.name === '🛑') {
                response = null;
            }
        }
        catch (err) {
            Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
        }
        return { message: sentMessage, response: response };
    }
}