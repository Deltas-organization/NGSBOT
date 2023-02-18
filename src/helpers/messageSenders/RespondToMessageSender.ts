import { Message, Client, GuildMember, User, BufferResolvable, DMChannel, NewsChannel, TextChannel, Attachment, AttachmentBuilder } from "discord.js";
import { Stream } from "stream";
import { Globals } from "../../Globals";
import { MessageContainer } from "../../message-helpers/MessageContainer";
import { MessageSender } from "./MessageSender";

export class RespondToMessageSender extends MessageSender {

    public get Channel(): TextChannel | DMChannel | NewsChannel {
        return <TextChannel | DMChannel | NewsChannel><any>this.originalMessage.channel;
    }

    public get GuildMember() {
        return this.originalMessage.member;
    }

    public get Requester() {
        return this.GuildMember?.user;
    }

    constructor(client: Client, public readonly originalMessage: Message) {
        super(client)
    }

    public async SendReactionMessage(message: string, authentication: (member: GuildMember | undefined) => boolean, yesReaction: () => Promise<any> | any, noReaction: () => Promise<any> | any = () => { }, storeMessage = true): Promise<{ message: Message, response: boolean | null } | undefined> {
        var sentMessage = await this.Channel.send({
            embeds: [{
                description: message
            }]
        });

        await sentMessage.react('✅');
        await sentMessage.react('❌');
        if (!this.originalMessage.guild)
            return;
        const guildMembers = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        const filter = (reaction, user: User) => {
            let member = guildMembers.find(mem => mem.id == user.id);
            return ['✅', '❌'].includes(reaction.emoji.name) && authentication(member);
        };
        let response: boolean | null = null;
        try {
            var collectedReactions = await sentMessage.awaitReactions({ filter, max: 1, time: 3e4, errors: ['time'] });
            var first = collectedReactions.first();
            if (first) {
                if (first.emoji.name === '✅') {
                    await yesReaction();
                    response = true;
                }
                if (first.emoji.name === '❌') {
                    await noReaction();
                    response = false;
                }
            }
        }
        catch (err) {
            Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
        }
        return { message: sentMessage, response: response };
    }

    public async SendFiles(files: (BufferResolvable | Stream | AttachmentBuilder)[]) {
        return this.Channel.send({ files: files });
    }

    public async SendFields(description: string, fields: { name: string, value: string }[]) {
        var sentMessage = await this.Channel.send({
            embeds: [{
                description: description,
                fields: fields
            }]
        });
        return sentMessage;
    }

    public async SendBasicMessage(message: string) {
        return await this.SendBasicMessageToChannel(message, this.Channel);
    }

    public async SendMessage(message: string) {
        return await this.SendMessageToChannel(message, this.Channel);
    }

    public async SendMessages(messages: string[]) {
        return await this.SendMessagesToChannel(messages, this.Channel);
    }

    public async DMMessage(message: string) {
        if (this.GuildMember) {
            var channel = await this.GuildMember.createDM();
            return await this.SendMessageToChannel(message, channel);
        }
    }

    public async DMMessages(messages: string[]) {
        if (this.GuildMember) {
            var channel = await this.GuildMember.createDM();
            return await this.SendMessagesToChannel(messages, channel);
        }
    }

    public async SendMessageFromContainer(messageContainer: MessageContainer, basic = false) {
        return await this.SendMessageFromContainerToChannel(messageContainer, this.Channel, basic);
    }
}
