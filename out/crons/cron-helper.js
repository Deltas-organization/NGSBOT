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
const CheckFlexMatches_1 = require("../commands/CheckFlexMatches");
const CheckReportedGames_1 = require("../commands/CheckReportedGames");
const CheckUnscheduledGamesForWeek_1 = require("../commands/CheckUnscheduledGamesForWeek");
const CleanupFreeAgentsChannel_1 = require("../commands/CleanupFreeAgentsChannel");
const DiscordChannels_1 = require("../enums/DiscordChannels");
const Globals_1 = require("../Globals");
const DataStoreWrapper_1 = require("../helpers/DataStoreWrapper");
const ChannelMessageSender_1 = require("../helpers/messageSenders/ChannelMessageSender");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const types_1 = require("../inversify/types");
const LiveDataStore_1 = require("../LiveDataStore");
const HistoryDisplay_1 = require("../scheduled/HistoryDisplay");
const moment = require("moment");
const CheckPendingMembers_1 = require("../commands/CheckPendingMembers");
const NGSMongoHelper_1 = require("../helpers/NGSMongoHelper");
const CleanupLFGChannel_1 = require("../commands/CleanupLFGChannel");
const TrackedChannelWorker_1 = require("../commands/TrackedChannelWorker");
let CronHelper = class CronHelper {
    constructor(client, token, apiToken, mongoConnection) {
        this.client = client;
        this.token = token;
        this.dataStore = new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken));
        this.mongoHelper = new NGSMongoHelper_1.NGSMongoHelper(mongoConnection);
        this.messageSender = new ChannelMessageSender_1.ChannelMessageSender(this.client);
        this.historyDisplay = new HistoryDisplay_1.HistoryDisplay(this.dataStore);
        this.cleanupFreeAgentsChannel = new CleanupFreeAgentsChannel_1.CleanupFreeAgentsChannel(this.client);
        this.checkReportedGames = new CheckReportedGames_1.CheckReportedGames(this.client, this.dataStore);
        this.checkUnscheduledGamesForWeek = new CheckUnscheduledGamesForWeek_1.CheckUnscheduledGamesForWeek(this.mongoHelper, this.dataStore);
        this.checkFlexMatches = new CheckFlexMatches_1.CheckFlexMatches(this.dataStore);
        this.checkPendingMembers = new CheckPendingMembers_1.CheckPendingMembers(apiToken, this.dataStore, this.mongoHelper);
        this.cleanupLFGChannel = new CleanupLFGChannel_1.CleanupLFGChannel(this.client);
        this.notifyOfTrackedChannels = new TrackedChannelWorker_1.TrackedChannelWorker(this.mongoHelper, this.client);
    }
    sendSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const games = yield ScheduleHelper_1.ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
            if (games.length > 0) {
                const messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(games);
                for (var index = 0; index < messages.length; index++) {
                    yield this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels_1.DiscordChannels.NGSHype, true);
                }
            }
        });
    }
    sendScheduleByDivision(channel, ...divisions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const messages = yield ScheduleHelper_1.ScheduleHelper.GetTodaysGamesByDivisions(this.dataStore, ...divisions);
            if (messages) {
                for (var index = 0; index < messages.length; index++) {
                    yield this.messageSender.SendToDiscordChannel(messages[index], channel);
                }
            }
        });
    }
    sendRequestedSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const requestedSchedules = yield this.mongoHelper.getRequestedSchedules();
            for (var schedule of requestedSchedules) {
                try {
                    if (schedule.requestType == "divisions") {
                        try {
                            if (schedule.divisions)
                                yield this.sendScheduleByDivision(schedule.channelId, ...schedule.divisions);
                        }
                        catch (e) {
                            Globals_1.Globals.log(`unable to send schedule: ${e}`);
                        }
                    }
                }
                catch (exception) {
                    Globals_1.Globals.log(exception);
                }
            }
        });
    }
    CheckHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const messages = yield this.historyDisplay.GetRecentHistory(1);
            if (messages) {
                for (var index = 0; index < messages.length; index++) {
                    yield this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels_1.DiscordChannels.DeltaServer);
                    yield this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels_1.DiscordChannels.NGSHistory);
                }
            }
        });
    }
    DeleteOldMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            try {
                yield this.cleanupFreeAgentsChannel.NotifyUsersOfDelete(60);
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
            try {
                yield this.cleanupFreeAgentsChannel.DeleteOldMessages(65);
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
    CheckReportedGames() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const messages = yield this.checkReportedGames.Check();
            try {
                if (messages) {
                    for (const message of messages.CaptainMessages) {
                        yield this.messageSender.SendToDiscordChannelAsBasic(message, DiscordChannels_1.DiscordChannels.NGSCaptains);
                    }
                    for (const message of messages.ModMessages) {
                        yield this.messageSender.SendToDiscordChannelAsBasic(message, DiscordChannels_1.DiscordChannels.NGSMods);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    CheckWeekendUnScheduledGames() {
        return __awaiter(this, void 0, void 0, function* () {
            var weekday = moment().isoWeekday();
            var isFridaySaturdaySunday = weekday >= 5;
            if (!isFridaySaturdaySunday)
                return;
            var isSunday = weekday == 7;
            yield this.client.login(this.token);
            const messages = yield this.checkUnscheduledGamesForWeek.Check(isSunday);
            try {
                if (messages) {
                    for (const message of messages) {
                        yield this.messageSender.SendToDiscordChannelAsBasic(message.CreateStringMessage(), DiscordChannels_1.DiscordChannels.NGSMods);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    CheckFlexMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const container = yield this.checkFlexMatches.Check();
            try {
                if (container)
                    yield this.messageSender.SendFromContainerToDiscordChannel(container, DiscordChannels_1.DiscordChannels.NGSMods);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    MessageAboutPendingMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            const container = yield this.checkPendingMembers.GetMembersPendingMessage();
            try {
                if (container)
                    yield this.messageSender.SendFromContainerToDiscordChannel(container, DiscordChannels_1.DiscordChannels.NGSMods, true);
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    DeleteLFGMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            try {
                yield this.cleanupLFGChannel.DeleteOldMessages(4);
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
    SendMessageAboutTrackedChannels() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.login(this.token);
            try {
                var reminders = yield this.notifyOfTrackedChannels.SendReminders();
                if (reminders) {
                    for (var reminder of reminders) {
                        try {
                            yield this.messageSender.SendToDiscordChannelAsBasic(reminder.messagehelper.CreateStringMessage(), reminder.channelId);
                        }
                        catch (e) {
                            Globals_1.Globals.log("Unable to send Reminder", reminder, e);
                        }
                    }
                }
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
};
CronHelper = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.Client)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.Token)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ApiToken)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.MongConection)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, String, String])
], CronHelper);
exports.CronHelper = CronHelper;
//# sourceMappingURL=cron-helper.js.map