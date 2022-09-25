import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./inversify/types";
import { LiveDataStore } from "./LiveDataStore";
import { MessageStore } from "./MessageStore";
import { CommandDependencies } from "./helpers/TranslatorDependencies";
import { DiscordChannels } from "./enums/DiscordChannels";
import { AssignNewUserCommand } from "./commands/AssignNewUserCommand";
import { DataStoreWrapper } from "./helpers/DataStoreWrapper";
import { NGSRoles } from "./enums/NGSRoles";
import { RoleHelper } from "./helpers/RoleHelper";
import { MessageContainer } from "./message-helpers/MessageContainer";
import { ChannelMessageSender } from "./helpers/messageSenders/ChannelMessageSender";
import { PmMessageInteraction } from "./message-helpers/PmMessageInteraction";
import { TranslatorService } from "./translators/core/TranslatorService";
import { Globals } from "./Globals";
import { CommandCreatorService } from "./SlashCommands/CommandCreatorService";

@injectable()
export class Bot {
    private dependencies: CommandDependencies;
    private messageSender: ChannelMessageSender;
    private pmMessageInteraction: PmMessageInteraction;
    private translatorService: TranslatorService;
    private commandCreatorService: CommandCreatorService;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string,
        @inject(TYPES.BotCommand) botCommand: string
    ) {
        this.dependencies = new CommandDependencies(client, new MessageStore(), new DataStoreWrapper(new LiveDataStore(apiToken)), apiToken, mongoConnection);
        this.messageSender = new ChannelMessageSender(client, this.dependencies.messageStore);
        this.pmMessageInteraction = new PmMessageInteraction(client, this.dependencies);
        this.translatorService = new TranslatorService(botCommand, this.dependencies);
        this.commandCreatorService = new CommandCreatorService(client, this.dependencies.dataStore);
        Globals.ChannelSender = this.messageSender;
    }

    public listen(): Promise<string> {
        this.client.on('messageCreate', async (message: Message) => {
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
        this.client.on('messageCreate', async (message: Message) => {
            if (message.channel.id == DiscordChannels.NGSFreeAgents) {
                if (freeAgentRole == null) {
                    if (message.guild) {
                        const roleHelper = await RoleHelper.CreateFrom(message.guild);
                        freeAgentRole = roleHelper.lookForRole(NGSRoles.FreeAgents);
                    }
                }
                if (message.member)
                    message.member.roles.add(freeAgentRole);
            }
        });
    }

    private async OnMessageReceived(message: Message) {
        this.translatorService.runTranslators(message);

        if (message.channel.type == "DM" && message.author.bot == false) {
            await this.pmMessageInteraction.ReceivePM(message);
        }
    }
}