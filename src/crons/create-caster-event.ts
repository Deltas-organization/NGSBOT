import { inject, injectable } from "inversify";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { Client, GuildScheduledEventCreateOptions, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from "discord.js";
import { TYPES } from "../inversify/types";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { LiveDataStore } from "../LiveDataStore";
import { NGSMongoHelper } from "../helpers/NGSMongoHelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { DiscordChannels } from "../enums/DiscordChannels";
import { DiscordGuilds } from "../enums/DiscordGuilds";
import { INGSSchedule } from "../interfaces";
import moment = require("moment");

@injectable()
export class CreateCasterEvents {
    private dataStore: DataStoreWrapper;
    private _eventDuration = 120; //in minutes
    private _eventGuild = DiscordGuilds.NGS;

    constructor(
        @inject(TYPES.Client) private _client: Client,
        @inject(TYPES.Token) private _token: string,
        @inject(TYPES.ApiToken) apiToken: string
    ) {
        this.dataStore = new DataStoreWrapper(new LiveDataStore(apiToken));
    }

    public async CheckForNewCastedGames() {
        const matches: INGSSchedule[] = await ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
        const guild = await this._client.guilds.fetch(this._eventGuild);
        const events = (await guild.scheduledEvents.fetch()).map((event, _, __) => event);
        for (var match of matches) {
            const hasCaster = ScheduleHelper.SanitizeCasterURL(match);
            if (hasCaster) {
                const startTime = moment(+match.scheduledTime.startTime);
                let eventAlreadyExists = false;
                for (var event of events) {
                    const eventStarTime = moment(event.scheduledStartTimestamp);
                    if (event.entityMetadata?.location == match.casterUrl && eventStarTime.isSame(startTime)) {
                        eventAlreadyExists = true;
                        break;
                    }
                }
                if (!eventAlreadyExists) {
                    await guild.scheduledEvents.create(this.CreateNewEvent(startTime, match));
                }
            }
        }
    }

    private CreateNewEvent(startTimeMoment: moment.Moment, match: INGSSchedule): GuildScheduledEventCreateOptions {
        const eventName = `${match.divisionDisplayName}: ${match.home.teamName} VS ${match.away.teamName}`;
        const startTime = startTimeMoment.toDate();
        const endTime = startTimeMoment.add(this._eventDuration, "minutes").toDate();
        return {
            name: eventName,
            scheduledStartTime: startTime,
            scheduledEndTime: endTime,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: match.casterUrl
            }
        }
    }
}