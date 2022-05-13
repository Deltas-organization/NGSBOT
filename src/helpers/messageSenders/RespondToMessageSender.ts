import { Message, Client, GuildMember, User, FileOptions, BufferResolvable, MessageAttachment, DMChannel, NewsChannel, TextChannel } from "discord.js";
import { Stream } from "stream";
import { Globals } from "../../Globals";
import { MessageContainer } from "../../message-helpers/MessageContainer";
import { MessageStore } from "../../MessageStore";
import { MessageWrapper } from "../MessageWrapper";
import { MessageSender } from "./MessageSender";

export class RespondToMessageSender extends MessageSender {

    public get Channel() {
        return this.originalMessage.channel;
    }

    public get GuildMember() {
        return this.originalMessage.member;
    }

    public get Requester() {
        return this.GuildMember.user;
    }

    constructor(client: Client, public readonly originalMessage: Message, messageStore: MessageStore) {
        super(client, messageStore)
    }
    
    public async SendReactionMessage(message: string, authentication: (member: GuildMember) => boolean, yesReaction: () => Promise<any> | any, noReaction: () => Promise<any> | any = () => { }, storeMessage = true) {
        var sentMessage = await this.Channel.send({
            embed: {
                color: 0,
                description: message
            }
        });
        if (storeMessage)
            this.messageStore.AddMessage(sentMessage);

        await sentMessage.react('✅');
        await sentMessage.react('❌');
        const guildMembers = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        const filter = (reaction, user: User) => {
            let member = guildMembers.find(mem => mem.id == user.id);
            return ['✅', '❌'].includes(reaction.emoji.name) && authentication(member);
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
        }
        catch (err) {
            Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
        }
        return { message: sentMessage, response: response };
    }

    public async SendFiles(files: (FileOptions | BufferResolvable | Stream | MessageAttachment)[]) {
        return this.Channel.send({files: files });
    }
    
    public async SendFields(description: string, fields: { name: string, value: string }[]) {
        var sentMessage = await this.Channel.send({
            embed: {
                color: 0,
                description: description,
                fields: fields
            }
        });
        this.messageStore.AddMessage(sentMessage);
        return sentMessage;
    }

    public async SendBasicMessage(message: string)
    {
        return await this.SendBasicMessageToChannel(message, this.Channel);
    }

    public async SendMessage(message: string, storeMessage: boolean = true)
    {
        return await this.SendMessageToChannel(message, this.Channel, storeMessage);
    }

    public async SendMessages(messages: string[], storeMessage = true){
        return await this.SendMessagesToChannel(messages, this.Channel, storeMessage);
    }

    public async DMMessage(message: string)
    {
        return await this.SendMessageToChannel(message, this.Channel, false);
    }

    public async DMMessages(messages: string[]){
        return await this.SendMessagesToChannel(messages, this.Channel, false);
    }

    public async SendMessageFromContainer(messageContainer: MessageContainer) {
        return await this.SendMessageFromContainerToChannel(messageContainer, this.Channel)
    }
}
