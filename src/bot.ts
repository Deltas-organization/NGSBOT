import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./inversify/types";
import { ITranslate } from "./interfaces/ITranslator";
import { ScheduleLister } from "./translators/ScheduleLister";
import { CommandLister } from "./translators/commandLister";
import { LiveDataStore } from "./LiveDataStore";
import { MessageStore } from "./MessageStore";
import { CommandDependencies } from "./helpers/TranslatorDependencies";
import { DeleteMessage } from "./translators/DeleteMessage";
import { ConfigSetter } from "./translators/ConfigSetter";
import { SearchPlayers } from "./translators/SearchPlayers";
import { TeamNameChecker } from "./translators/TeamChecker";
import { AssignRoles } from "./translators/AssignRoles";
import { RegisteredCount } from "./translators/RegisteredCount";
import { Purge } from "./translators/Purge";
import { SendChannelMessage } from "./helpers/SendChannelMessage";
import { DiscordChannels } from "./enums/DiscordChannels";
import { HistoryDisplay } from "./scheduled/HistoryDisplay";
import { Reload } from "./translators/Reload";
import { NGSDivisions } from "./enums/NGSDivisions";
import { GamesCommand } from "./translators/GamesCommand";
import { NonCastedGamesCommand } from "./translators/NonCastedGamesCommand";
import { AssignNewUserCommand } from "./commands/AssignNewUserCommand";
import { DataStoreWrapper } from "./helpers/DataStoreWrapper";
import { UpdateCaptainsListCommand } from "./commands/UpdateCaptainsListCommand";

@injectable()
export class Bot {
    private translators: ITranslate[] = [];
    private scheduleLister: ScheduleLister;
    private dependencies: CommandDependencies;
    private messageSender: SendChannelMessage;
    private historyDisplay: HistoryDisplay;
    private captainsListCommand: UpdateCaptainsListCommand;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
    ) {
        this.dependencies = new CommandDependencies(client, new MessageStore(), new DataStoreWrapper(new LiveDataStore()));
        this.messageSender = new SendChannelMessage(client, this.dependencies.messageStore);
        this.historyDisplay = new HistoryDisplay(this.dependencies);

        this.scheduleLister = new ScheduleLister(this.dependencies);
        this.captainsListCommand = new UpdateCaptainsListCommand(this.dependencies);
        this.translators.push(this.scheduleLister);
        this.translators.push(new DeleteMessage(this.dependencies));
        this.translators.push(new ConfigSetter(this.dependencies));
        this.translators.push(new SearchPlayers(this.dependencies));
        this.translators.push(new TeamNameChecker(this.dependencies));
        this.translators.push(new AssignRoles(this.dependencies));
        this.translators.push(new RegisteredCount(this.dependencies));
        this.translators.push(new Purge(this.dependencies));
        this.translators.push(new Reload(this.dependencies));
        this.translators.push(new GamesCommand(this.dependencies));
        this.translators.push(new NonCastedGamesCommand(this.dependencies));

        this.translators.push(new CommandLister(this.dependencies, this.translators));
    }

    public listen(): Promise<string> {
        this.client.on('message', async (message: Message) => {
            this.OnMessageReceived(message);
        });

        return this.client.login(this.token);
    }

    public watchForUserJoin() {
        this.client.on('guildMemberAdd', async member => {
            let newUserCommand = new AssignNewUserCommand(this.dependencies);
            let message = await newUserCommand.AssignUser(member);
            await this.messageSender.SendMessageToChannel(message, DiscordChannels.DeltaServer);
        });
    }

    private OnMessageReceived(message: Message) {
        this.checkTranslators(message);
    }

    private checkTranslators(message: Message) {
        let originalContent = message.content;
        if (/^\>/.test(originalContent)) {
            var trimmedValue = originalContent.substr(1);
            this.translators.forEach(translator => {
                translator.Translate(trimmedValue, message);
            });
        }
    }

    public async sendSchedule() {
        await this.dependencies.client.login(this.token);
        let messages = await this.scheduleLister.getGameMessagesForToday();
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHype);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
            }
        }
    }

    public async sendScheduleByDivision(division: NGSDivisions, ...channels: DiscordChannels[]) {
        await this.dependencies.client.login(this.token);
        let messages = await this.scheduleLister.getGameMessagesForTodayByDivision(division);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                for (var channel of channels) {
                    await this.messageSender.SendMessageToChannel(messages[index], channel);
                }
            }
        }
    }

    public async sendScheduleForDad() {
        await this.sendScheduleByDivision(NGSDivisions.BSouthEast, DiscordChannels.DadSchedule);
    }

    public async sendScheduleForMom() {
        await this.sendScheduleByDivision(NGSDivisions.DEast, DiscordChannels.MomSchedule);
    }

    public async sendScheduleForSis() {
        await this.sendScheduleByDivision(NGSDivisions.EEast, DiscordChannels.SisSchedule);
    }

    public async CheckHistory() {
        await this.dependencies.client.login(this.token);
        let messages = await this.historyDisplay.GetRecentHistory(1);
        if (messages) {
            for (var index = 0; index < messages.length; index++) {
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.DeltaServer);
                await this.messageSender.SendMessageToChannel(messages[index], DiscordChannels.NGSHistory);
            }
        }
    }

    public async CreateCaptainList() {
        await this.dependencies.client.login(this.token);
        let message = await this.captainsListCommand.UpdateDivisionList(NGSDivisions.BSouthEast, DiscordChannels.DeltaServer);
        await this.messageSender.OverwriteMessage(message, "835238360288067644", DiscordChannels.DeltaServer, true);
    }
}