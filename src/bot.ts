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
import { Leave } from "./translators/Leave";
import { MessageDictionary } from "./helpers/MessageDictionary";
import { ToggleFreeAgentRole } from "./translators/ToggleFreeAgentRole";
import { CleanupFreeAgentsChannel } from "./commands/CleanupFreeAgentsChannel";
import { Globals } from "./Globals";
import { UnUsedRoles } from "./translators/UnusedRoles";
import { UpdateCaptainsList } from "./translators/UpdateCaptainsList";
import { NGSRoles } from "./enums/NGSRoles";
import { RoleHelper } from "./helpers/RoleHelper";
import { WatchSchedule } from "./translators/WatchSchedule";

@injectable()
export class Bot {
    private translators: ITranslate[] = [];
    private scheduleLister: ScheduleLister;
    private dependencies: CommandDependencies;
    private messageSender: SendChannelMessage;
    private captainsListCommand: UpdateCaptainsListCommand;
    private assignFreeAgentTranslator: ToggleFreeAgentRole;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string
    ) {
        this.dependencies = new CommandDependencies(client, new MessageStore(), new DataStoreWrapper(new LiveDataStore(apiToken)), apiToken, mongoConnection);
        this.messageSender = new SendChannelMessage(client, this.dependencies.messageStore);

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
        this.translators.push(new Leave(this.dependencies));
        this.translators.push(new UnUsedRoles(this.dependencies));
        this.translators.push(new UpdateCaptainsList(this.dependencies));
        this.translators.push(new WatchSchedule(this.dependencies));

        this.translators.push(new CommandLister(this.dependencies, this.translators));
        this.assignFreeAgentTranslator = new ToggleFreeAgentRole(this.dependencies);
    }

    public listen(): Promise<string> {
        this.client.on('message', async (message: Message) => {
            this.OnMessageReceived(message);
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
            const stringMessage = message.CreateStringMessage();
            if (message.Options.FoundTeam)
            {
                await this.messageSender.SendMessageToChannel(stringMessage, DiscordChannels.NGSDiscord);
            }
            await this.messageSender.SendMessageToChannel(stringMessage, DiscordChannels.DeltaServer);
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
        else if (/^\!/.test(originalContent)) {
            var trimmedValue = originalContent.substr(1);
            this.assignFreeAgentTranslator.Translate(trimmedValue, message);
        }
    }
}