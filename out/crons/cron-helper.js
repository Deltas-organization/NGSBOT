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
exports.CronHelper = void 0;
const discord_js_1 = require("discord.js");
const inversify_1 = require("inversify");
const CleanupFreeAgentsChannel_1 = require("../commands/CleanupFreeAgentsChannel");
const DiscordChannels_1 = require("../enums/DiscordChannels");
const NGSDivisions_1 = require("../enums/NGSDivisions");
const Globals_1 = require("../Globals");
const DataStoreWrapper_1 = require("../helpers/DataStoreWrapper");
const Mongohelper_1 = require("../helpers/Mongohelper");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const SendChannelMessage_1 = require("../helpers/SendChannelMessage");
const types_1 = require("../inversify/types");
const LiveDataStore_1 = require("../LiveDataStore");
const MessageStore_1 = require("../MessageStore");
const HistoryDisplay_1 = require("../scheduled/HistoryDisplay");
let CronHelper = /** @class */ (() => {
    let CronHelper = class CronHelper {
        constructor(client, token, apiToken, mongoConnection) {
            this.client = client;
            this.token = token;
            this.dataStore = new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken));
            this.messageSender = new SendChannelMessage_1.SendChannelMessage(this.client, new MessageStore_1.MessageStore());
            this.historyDisplay = new HistoryDisplay_1.HistoryDisplay(this.dataStore);
            this.cleanupFreeAgentsChannel = new CleanupFreeAgentsChannel_1.CleanupFreeAgentsChannel(this.client);
            this.mongoHelper = new Mongohelper_1.Mongohelper(mongoConnection);
        }
        sendSchedule() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.login(this.token);
                const games = yield ScheduleHelper_1.ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
                if (games.length > 1) {
                    const messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(games);
                    for (var index = 0; index < messages.length; index++) {
                        yield this.messageSender.SendMessageToChannel(messages[index], DiscordChannels_1.DiscordChannels.NGSHype);
                        yield this.messageSender.SendMessageToChannel(messages[index], DiscordChannels_1.DiscordChannels.DeltaServer);
                    }
                }
            });
        }
        sendScheduleForDad() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.sendScheduleByDivision(DiscordChannels_1.DiscordChannels.DeltaServer, NGSDivisions_1.NGSDivisions.BSouthEast);
            });
        }
        sendScheduleForSis() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.sendScheduleByDivision(DiscordChannels_1.DiscordChannels.SisSchedule, NGSDivisions_1.NGSDivisions.EEast);
            });
        }
        sendScheduleForMom() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.sendScheduleByDivision(DiscordChannels_1.DiscordChannels.MomSchedule, NGSDivisions_1.NGSDivisions.BSouthEast);
            });
        }
        sendScheduleByDivision(channel, ...divisions) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.login(this.token);
                let messages = yield ScheduleHelper_1.ScheduleHelper.GetTodaysGamesByDivisions(this.dataStore, ...divisions);
                if (messages) {
                    for (var index = 0; index < messages.length; index++) {
                        yield this.messageSender.SendMessageToChannel(messages[index], channel);
                    }
                }
            });
        }
        sendRequestedSchedules() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.login(this.token);
                const requestedSchedules = yield this.mongoHelper.getRequestedSchedules();
                for (var schedule of requestedSchedules) {
                    if (schedule.requestType == "divisions") {
                        try {
                            yield this.sendScheduleByDivision(schedule.channelId, ...schedule.divisions);
                        }
                        catch (e) {
                            Globals_1.Globals.log(`unable to send schedule: ${e}`);
                        }
                    }
                }
            });
        }
        CheckHistory() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.login(this.token);
                let messages = yield this.historyDisplay.GetRecentHistory(1);
                if (messages) {
                    for (var index = 0; index < messages.length; index++) {
                        yield this.messageSender.SendMessageToChannel(messages[index], DiscordChannels_1.DiscordChannels.DeltaServer);
                        yield this.messageSender.SendMessageToChannel(messages[index], DiscordChannels_1.DiscordChannels.NGSHistory);
                    }
                }
            });
        }
        DeleteOldMessages() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.client.login(this.token);
                try {
                    yield this.cleanupFreeAgentsChannel.NotifyUsersOfDelete(60);
                    yield this.cleanupFreeAgentsChannel.DeleteOldMessages(65);
                }
                catch (e) {
                    Globals_1.Globals.log(e);
                }
            });
        }
    };
    CronHelper = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject(types_1.TYPES.Client)),
        __param(1, inversify_1.inject(types_1.TYPES.Token)),
        __param(2, inversify_1.inject(types_1.TYPES.ApiToken)),
        __param(3, inversify_1.inject(types_1.TYPES.MongConection)),
        __metadata("design:paramtypes", [discord_js_1.Client, String, String, String])
    ], CronHelper);
    return CronHelper;
})();
exports.CronHelper = CronHelper;
//# sourceMappingURL=cron-helper.js.map