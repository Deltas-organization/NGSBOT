import { CacheType, Client, CommandInteractionOption, Guild, GuildChannel } from "discord.js";
import { NGSMongoHelper } from "../../helpers/NGSMongoHelper";

export class TrackChannelWorker {
    private _mongoHelper: NGSMongoHelper;

    public constructor(private mongoConnectionUri: string) {
        this._mongoHelper = new NGSMongoHelper(this.mongoConnectionUri);
    }

    public async Run(channelId: string, options: readonly CommandInteractionOption<CacheType>[]): Promise<'Added' | 'Deleted'> {
        if (options.length > 0) {
            var optionValue = options[0];
            return await this._mongoHelper.AddorStopTrackedChannelsInformation(channelId, +optionValue.value!);
        }
        else {
            return await this._mongoHelper.AddorStopTrackedChannelsInformation(channelId, 1);
        }
    }
}