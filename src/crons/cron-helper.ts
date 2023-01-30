import { Client } from "discord.js";
import { inject, injectable } from "inversify";
import { CheckFlexMatches } from "../commands/CheckFlexMatches";
import { CheckReportedGames } from "../commands/CheckReportedGames";
import { CheckUnscheduledGamesForWeek } from "../commands/CheckUnscheduledGamesForWeek";
import { CleanupFreeAgentsChannel } from "../commands/CleanupFreeAgentsChannel";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { ChannelMessageSender } from "../helpers/messageSenders/ChannelMessageSender";
import { Mongohelper } from "../helpers/Mongohelper";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { TYPES } from "../inversify/types";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { HistoryDisplay } from "../scheduled/HistoryDisplay";
import moment = require("moment");
import { CheckPendingMembers } from "../commands/CheckPendingMembers";

@injectable()
export class CronHelper {
    private dataStore: DataStoreWrapper;
    private messageSender: ChannelMessageSender;
    private historyDisplay: HistoryDisplay;
    private cleanupFreeAgentsChannel: CleanupFreeAgentsChannel;
    private mongoHelper: Mongohelper;
    private checkReportedGames: CheckReportedGames;
    private checkUnscheduledGamesForWeek: CheckUnscheduledGamesForWeek;
    private checkFlexMatches: CheckFlexMatches;
    private checkPendingMembers: CheckPendingMembers;

    constructor(
        @inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string
    ) {
        this.dataStore = new DataStoreWrapper(new LiveDataStore(apiToken));
        this.mongoHelper = new Mongohelper(mongoConnection);

        this.messageSender = new ChannelMessageSender(this.client, new MessageStore());
        this.historyDisplay = new HistoryDisplay(this.dataStore);
        this.cleanupFreeAgentsChannel = new CleanupFreeAgentsChannel(this.client);
        this.checkReportedGames = new CheckReportedGames(this.client, this.dataStore);
        this.checkUnscheduledGamesForWeek = new CheckUnscheduledGamesForWeek(this.mongoHelper, this.dataStore);
        this.checkFlexMatches = new CheckFlexMatches(this.dataStore);
        this.checkPendingMembers = new CheckPendingMembers(apiToken, this.dataStore, this.mongoHelper);
    }

    public async sendSchedule() {
        await this.client.login(this.token);
        const games = await ScheduleHelper.GetTodaysGamesSorted(this.dataStore);
        if (games.length > 0) {
            const messages = await ScheduleHelper.GetMessages(games);
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels.NGSHype);
                await this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels.DeltaServer);
            }
        }
    }

    public async sendScheduleForDad() {
        await this.sendScheduleByDivision(DiscordChannels.DeltaServer, NGSDivisions.Nexus);
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
                await this.messageSender.SendToDiscordChannel(messages[index], channel);
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
                        if (schedule.divisions)
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
                await this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels.DeltaServer);
                await this.messageSender.SendToDiscordChannel(messages[index], DiscordChannels.NGSHistory);
            }
        }
    }

    public async DeleteOldMessages() {
        await this.client.login(this.token);
        try {
            await this.cleanupFreeAgentsChannel.NotifyUsersOfDelete(60);
        }
        catch (e) {
            Globals.log(e);
        }
        try {
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
            if (messages) {
                for (const message of messages.CaptainMessages) {
                    await this.messageSender.SendToDiscordChannelAsBasic(message, DiscordChannels.NGSCaptains);
                }
                for (const message of messages.ModMessages) {
                    await this.messageSender.SendToDiscordChannelAsBasic(message, DiscordChannels.NGSMods);
                }
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
            if (messages) {
                for (const message of messages) {
                    await this.messageSender.SendToDiscordChannelAsBasic(message.CreateStringMessage(), DiscordChannels.NGSMods);
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    public async CheckFlexMatches() {
        await this.client.login(this.token);
        const container = await this.checkFlexMatches.Check();
        try {
            if (container)
                await this.messageSender.SendFromContainerToDiscordChannel(container, DiscordChannels.NGSMods);
        }
        catch (e) {
            console.log(e);
        }
    }

    public async MessageAboutPendingMembers() {
        await this.client.login(this.token);
        const container = await this.checkPendingMembers.GetMembersPendingMessage();
        try {
            if (container)
                await this.messageSender.SendFromContainerToDiscordChannel(container, DiscordChannels.NGSMods, true);
        }
        catch (e) {
            console.log(e);
        }
    }
}