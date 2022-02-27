import { Client } from "discord.js";
import { inject, injectable } from "inversify";
import moment = require("moment");
import { CheckReportedGames } from "../commands/CheckReportedGames";
import { CheckUnscheduledGamesForWeek } from "../commands/CheckUnscheduledGamesForWeek";
import { CleanupFreeAgentsChannel } from "../commands/CleanupFreeAgentsChannel";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { MessageHelper } from "../helpers/MessageHelper";
import { Mongohelper } from "../helpers/Mongohelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { SendChannelMessage } from "../helpers/SendChannelMessage";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { TYPES } from "../inversify/types";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { HistoryDisplay } from "../scheduled/HistoryDisplay";
import { ScheduleLister } from "../translators/ScheduleLister";

@injectable()
export class CronHelper {
    private dataStore: DataStoreWrapper;
    private messageSender: SendChannelMessage;
    private historyDisplay: HistoryDisplay;
    private cleanupFreeAgentsChannel: CleanupFreeAgentsChannel;
    private mongoHelper: Mongohelper;
    private checkReportedGames: CheckReportedGames;
    private checkUnscheduledGamesForWeek: CheckUnscheduledGamesForWeek;

    constructor(
        @inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string
    ) {
        this.dataStore = new DataStoreWrapper(new LiveDataStore(apiToken));
        this.messageSender = new SendChannelMessage(this.client, new MessageStore());
        this.historyDisplay = new HistoryDisplay(this.dataStore);
        this.cleanupFreeAgentsChannel = new CleanupFreeAgentsChannel(this.client);
        this.checkReportedGames = new CheckReportedGames(this.client, this.dataStore);
        this.checkUnscheduledGamesForWeek = new CheckUnscheduledGamesForWeek(this.client, this.dataStore);
        this.mongoHelper = new Mongohelper(mongoConnection);
    }

    public async sendSchedule() {
        await this.client.login(this.token);
        const games = await ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
        if (games.length > 0) {
            const messages = await ScheduleHelper.GetMessages(games);
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHype);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
            }
        }
    }

    public async sendScheduleForDad() {
        await this.sendScheduleByDivision(DiscordChannels.DeltaServer, NGSDivisions.AEast);
    }

    public async sendScheduleForSis() {
        await this.sendScheduleByDivision(DiscordChannels.SisSchedule, NGSDivisions.EEast);
    }

    public async sendScheduleForMom() {
        await this.sendScheduleByDivision(DiscordChannels.MomSchedule, NGSDivisions.BEast);
    }

    public async sendScheduleByDivision(channel: DiscordChannels | string, ...divisions: NGSDivisions[]) {
        await this.client.login(this.token);
        const messages = await ScheduleHelper.GetTodaysGamesByDivisions(this.dataStore, ...divisions);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], channel);
            }
        }
    }

    public async sendRequestedSchedules() {
        await this.client.login(this.token);
        const requestedSchedules = await this.mongoHelper.getRequestedSchedules();
        for (var schedule of requestedSchedules) {
            try {
                if (schedule.requestType == "divisions") {
                    try {
                        await this.sendScheduleByDivision(schedule.channelId, ...schedule.divisions);
                    }
                    catch (e) {
                        Globals.log(`unable to send schedule: ${e}`)
                    }
                }
            }
            catch (exception) {
                Globals.log(exception);
            }
        }
    }

    public async CheckHistory() {
        await this.client.login(this.token);
        const messages = await this.historyDisplay.GetRecentHistory(1);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHistory);
            }
        }
    }

    public async DeleteOldMessages() {
        await this.client.login(this.token);
        try {
            await this.cleanupFreeAgentsChannel.NotifyUsersOfDelete(60);
            await this.cleanupFreeAgentsChannel.DeleteOldMessages(65);
        }
        catch (e) {
            Globals.log(e);
        }
    }

    public async CheckReportedGames() {
        await this.client.login(this.token);
        const messages = await this.checkReportedGames.Check();
        try {
            for (const message of messages.CaptainMessages) {
                await this.messageSender.SendMessageToChannel(message, DiscordChannels.NGSCaptains);
            }
            for (const message of messages.ModMessages) {
                await this.messageSender.SendMessageToChannel(message, DiscordChannels.NGSMods);
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    public async CheckSundaysUnScheduledGames() {
        var IsSunday = moment().isoWeekday() == 7;
        if (!IsSunday)
            return;
        await this.client.login(this.token);
        const messages = await this.checkUnscheduledGamesForWeek.Check();
        try {
            for (const message of messages) {
                await this.messageSender.SendMessageToChannel(message.CreateStringMessage(), DiscordChannels.NGSMods, true);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}