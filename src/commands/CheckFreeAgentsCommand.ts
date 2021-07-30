import { Client, GuildChannel, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import moment = require("moment-timezone");
import { Globals } from "../Globals";

export class CheckFreeAgentsCommand {
    private client: Client;
    private dataStore: DataStoreWrapper;

    constructor(dependencies: CommandDependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }

    public async MessageFreeAgents(pastDayCount: number) {
        const guildChannel = await this.GetChannel(DiscordChannels.DeltaServer);
        let messages = (await guildChannel.messages.fetch({ limit: 10 })).map((message, _, __) => message);

        const currentDate = moment();
        console.log(currentDate);
        let messagesToDelete: Message[] = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            console.log(currentDate.diff(momentDate, 'days'));
            if (!message.pinned) {
                messagesToDelete.push(message);
            }
        }
        try {
            await guildChannel.bulkDelete(messagesToDelete);
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async GetChannel(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId, false)) as TextChannel;
        return channel;
    }
}
