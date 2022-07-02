import { Client, Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { ChannelMessageSender } from "../helpers/messageSenders/ChannelMessageSender";
import { MessageSender } from "../helpers/messageSenders/MessageSender";
import { Mongohelper } from "../helpers/Mongohelper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";

export class PmMessageInteraction {
    private messageSender: ChannelMessageSender;
    private mongoHelper: Mongohelper;

    constructor(client: Client, dependencies: CommandDependencies) {
        this.messageSender = new ChannelMessageSender(client, dependencies.messageStore);
    }

    public async ReceivePM(message: Message) {
        await this.messageSender.SendToDiscordChannel(`Message From ${message.author.username}: \n \n ${message.content}`, DiscordChannels.DeltaPmChannel);
    }
}