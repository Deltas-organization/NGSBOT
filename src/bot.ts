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
import { DiscordChannels } from "./enums/DiscordChannels";
import { Reload } from "./translators/Reload";
import { GamesCommand } from "./translators/GamesCommand";
import { NonCastedGamesCommand } from "./translators/NonCastedGamesCommand";
import { AssignNewUserCommand } from "./commands/AssignNewUserCommand";
import { DataStoreWrapper } from "./helpers/DataStoreWrapper";
import { Leave } from "./translators/Leave";
import { UnUsedRoles } from "./translators/UnusedRoles";
import { UpdateCaptainsList } from "./translators/UpdateCaptainsList";
import { NGSRoles } from "./enums/NGSRoles";
import { RoleHelper } from "./helpers/RoleHelper";
import { WatchSchedule } from "./translators/WatchSchedule";
import { SelfAssignRolesCreator } from "./translators/mongo/SelfAssignRolesCreator";
import { SelfAssignRolesWatcher } from "./translators/mongo/SelfAssignRolesWatcher";
import { SelfAssignRolesRemover } from "./translators/mongo/SelfAssignRolesRemover";
import { CoinFlip } from "./translators/CoinFlip";
import { RandomTranslator } from "./translators/Random";
import { TestTranslator } from "./translators/TestTranslator";
import { CleanupTranslator } from "./translators/Cleanup";
import { MessageContainer } from "./message-helpers/MessageContainer";
import { ChannelMessageSender } from "./helpers/messageSenders/ChannelMessageSender";

@injectable()
export class Bot {
    private translators: ITranslate[] = [];
    private exclamationTranslators: ITranslate[] = [];
    private scheduleLister: ScheduleLister;
    private dependencies: CommandDependencies;
    private messageSender: ChannelMessageSender;
    private botCommand: string;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string,
        @inject(TYPES.BotCommand) botCommand: string
    ) {
        this.dependencies = new CommandDependencies(client, new MessageStore(), new DataStoreWrapper(new LiveDataStore(apiToken)), apiToken, mongoConnection);
        this.messageSender = new ChannelMessageSender(client, this.dependencies.messageStore);
        this.botCommand = botCommand;

        this.scheduleLister = new ScheduleLister(this.dependencies);
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
        this.translators.push(new Leave(this.dependencies));
        this.translators.push(new UnUsedRoles(this.dependencies));
        this.translators.push(new UpdateCaptainsList(this.dependencies));
        this.translators.push(new WatchSchedule(this.dependencies));
        this.translators.push(new SelfAssignRolesCreator(this.dependencies));
        this.translators.push(new SelfAssignRolesRemover(this.dependencies));
        this.translators.push(new RandomTranslator(this.dependencies));
        this.translators.push(new TestTranslator(this.dependencies));
        this.translators.push(new CleanupTranslator(this.dependencies));

        this.translators.push(new CommandLister(this.dependencies, this.translators));
        this.exclamationTranslators.push(new SelfAssignRolesWatcher(this.dependencies));
        this.exclamationTranslators.push(new CoinFlip(this.dependencies));
    }

    public listen(): Promise<string> {
        this.client.on('message', async (message: Message) => {
            await this.OnMessageReceived(message);
        });

        return this.client.login(this.token);
    }

    public OnInitialize() {
        this.WatchForUserJoin();
        this.WatchForUserFreeAgent();
    }

    public WatchForUserJoin() {
        this.client.on('guildMemberAdd', async member => {
            let newUserCommand = new AssignNewUserCommand(this.dependencies);
            let message = await newUserCommand.AssignUser(member);
            if (message) {
                var messageGroup = message.MessageGroup;
                var messageContainer = new MessageContainer();
                messageContainer.Append(messageGroup);
                if (message.FoundTeam) {
                    await this.messageSender.SendToDiscordChannel(messageContainer.SingleMessage, DiscordChannels.NGSDiscord);
                }
                await this.messageSender.SendToDiscordChannel(messageContainer.SingleMessage, DiscordChannels.DeltaServer);
            }
        });
    }

    public WatchForUserFreeAgent() {
        let freeAgentRole;
        this.client.on('message', async (message: Message) => {
            if (message.channel.id == DiscordChannels.NGSFreeAgents) {
                if (freeAgentRole == null) {
                    const roleHelper = await RoleHelper.CreateFrom(message.guild);
                    freeAgentRole = roleHelper.lookForRole(NGSRoles.FreeAgents);
                }
                message.member.roles.add(freeAgentRole);
            }
        });
    }

    private async OnMessageReceived(message: Message) {
        this.checkTranslators(message);

        if (message.channel.type == "dm" && message.author.bot == false) {
            await this.messageSender.SendToDiscordChannel(`Message From ${message.author.username}: \n \n ${message.content}`, DiscordChannels.DeltaPmChannel);
        }
    }

    private checkTranslators(message: Message) {
        let originalContent = message.content;
        const command = this.botCommand
        let regex = new RegExp(`^${command}`, "g");
        if (regex.test(originalContent)) {
            var trimmedValue = originalContent.substring(1);
            this.translators.forEach(translator => {
                translator.Translate(trimmedValue, message);
            });
        }
        else if (/^\!/.test(originalContent)) {
            var trimmedValue = originalContent.substring(1);
            for (const translator of this.exclamationTranslators) {
                translator.Translate(trimmedValue, message);
            }
        }
    }
}