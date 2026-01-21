import { CacheType, Client, CommandInteractionOption, Guild, GuildChannel } from "discord.js";
import { NGSMongoHelper } from "../../helpers/NGSMongoHelper";
import { ChannelMessageSender } from "../../helpers/messageSenders/ChannelMessageSender";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordChannels } from "../../enums/DiscordChannels";

export class TrackChannelWorker {
    private _mongoHelper: NGSMongoHelper;
    private _guild: Guild;
    private _messageSender: ChannelMessageSender;

    public constructor(private client: Client<boolean>, private mongoConnectionUri: string) {
        this._mongoHelper = new NGSMongoHelper(this.mongoConnectionUri);
        this._messageSender = new ChannelMessageSender(this.client);
    }

    public async Run(channelId: string): Promise<'Added' | 'Deleted'> {
        this._guild = await this.GetGuild(DiscordChannels.NGSDiscord);
        return await this._mongoHelper.AddorStopTrackedChannelsInformation(channelId, 5);
    }
    
    private async GetGuild(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId)) as GuildChannel;
        return channel.guild;
    }
}