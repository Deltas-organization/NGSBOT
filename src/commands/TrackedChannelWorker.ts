import { Client, Guild, GuildChannel, GuildMember, Message, TextChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { ClientHelper } from "../helpers/ClientHelper";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { Mongohelper } from "../helpers/Mongohelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { ScheduleHelper, ScheduleInformation } from "../helpers/ScheduleHelper";
import { INGSSchedule, INGSUser } from "../interfaces";
import { LiveDataStore } from "../LiveDataStore";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { NGSMongoHelper } from "../helpers/NGSMongoHelper";
import moment = require("moment");

export class TrackedChannelWorker {

    private _currentDate: moment.Moment;

    constructor(private mongoHelper: NGSMongoHelper, private client: Client) {
        this._currentDate = moment();
    }

    public async SendReminders(): Promise<{ channelId: string, messagehelper: MessageHelper<void> }[] | undefined> {
        var result: { channelId: string, messagehelper: MessageHelper<void> }[] = [];
        try {
            var information = await this.mongoHelper.GetTrackedChannelsInformation();
            for (var value of information) {
                try {
                    const guildChannel = await this.GetChannel(value.channelId);
                    const messages = await guildChannel.messages.fetch({ limit: 1 });
                    const lastMessage = messages.first();
                    if (lastMessage && this.IsMessageOlderThen(lastMessage, value.reminderDays)) {
                        const messageToSend = new MessageHelper<void>();
                        messageToSend.AddNew(`This channel hasn't been interacted with in a while. Please either stop tracking the channel or continue discussion.`);
                        result.push({ channelId: value.channelId, messagehelper: messageToSend })
                    }
                }
                catch (e) {
                    Globals.log("Problem with channel retrieval.", e)
                }
            }
        }
        catch (e) {
            Globals.log("Problem reporting tracked channel.", e)
            Globals.InformDelta("There was a problem with the tracked channel reminder.");
        }
        return result;
    }

    private async GetChannel(channelId: string) {
        return (await this.client.channels.fetch(channelId)) as TextChannel;
    }

    private IsMessageOlderThen(message: Message, days: number): boolean {
        let momentDate = moment(message.createdTimestamp);
        const dateDifference = this._currentDate.diff(momentDate, 'days');
        if (dateDifference > days) {
            return true;
        }
        return false;
    }
}