"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCasterEvents = void 0;
const inversify_1 = require("inversify");
const DataStoreWrapper_1 = require("../helpers/DataStoreWrapper");
const discord_js_1 = require("discord.js");
const types_1 = require("../inversify/types");
const LiveDataStore_1 = require("../LiveDataStore");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const DiscordGuilds_1 = require("../enums/DiscordGuilds");
const moment = require("moment");
let CreateCasterEvents = class CreateCasterEvents {
    constructor(_client, _token, apiToken) {
        this._client = _client;
        this._token = _token;
        this._eventDuration = 60; //in minutes
        this.dataStore = new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken));
    }
    CheckForNewCastedGames() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const matches = yield ScheduleHelper_1.ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
            const guild = yield this._client.guilds.fetch(DiscordGuilds_1.DiscordGuilds.DeltasServer);
            const events = (yield guild.scheduledEvents.fetch()).map((event, _, __) => event);
            for (var match of matches) {
                const hasCaster = ScheduleHelper_1.ScheduleHelper.SanitizeCasterURL(match);
                if (hasCaster) {
                    const startTime = moment(+match.scheduledTime.startTime);
                    let eventAlreadyExists = false;
                    for (var event of events) {
                        const eventStarTime = moment(event.scheduledStartTimestamp);
                        if (((_a = event.entityMetadata) === null || _a === void 0 ? void 0 : _a.location) == match.casterUrl && eventStarTime.isSame(startTime)) {
                            eventAlreadyExists = true;
                            break;
                        }
                    }
                    if (!eventAlreadyExists) {
                        yield guild.scheduledEvents.create(this.CreateNewEvent(startTime, match));
                    }
                }
            }
        });
    }
    CreateNewEvent(startTimeMoment, match) {
        const eventName = `${match.divisionDisplayName}: ${match.home.teamName} VS ${match.away.teamName}`;
        const startTime = startTimeMoment.toDate();
        const endTime = startTimeMoment.add(this._eventDuration, "minutes").toDate();
        return {
            name: eventName,
            scheduledStartTime: startTime,
            scheduledEndTime: endTime,
            privacyLevel: discord_js_1.GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: discord_js_1.GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: match.casterUrl
            }
        };
    }
};
CreateCasterEvents = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.Client)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.Token)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ApiToken)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, String])
], CreateCasterEvents);
exports.CreateCasterEvents = CreateCasterEvents;
//# sourceMappingURL=create-caster-event.js.map