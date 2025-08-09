import { ChannelType, Client, Message, MessageReaction, MessageType, PartialMessageReaction, PartialUser, ReactionEmoji, Role, TextChannel, User } from "discord.js";
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
import { TypeFlags } from "typescript";
import { MessageChecker } from "./messageChecker";
import { DiscordGuilds } from "./enums/DiscordGuilds";

@injectable()
export class Bot {
    private dependencies: CommandDependencies;
    private messageSender: ChannelMessageSender;
    private pmMessageInteraction: PmMessageInteraction;
    private translatorService: TranslatorService;
    private messageChecker: MessageChecker;
    private commandCreatorService: CommandCreatorService;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
        @inject(TYPES.ApiToken) apiToken: string,
        @inject(TYPES.MongConection) mongoConnection: string,
        @inject(TYPES.BotCommand) botCommand: string
    ) {
        this.dependencies = new CommandDependencies(client, new DataStoreWrapper(new LiveDataStore(apiToken)), apiToken, mongoConnection);
        this.messageSender = new ChannelMessageSender(client);
        this.pmMessageInteraction = new PmMessageInteraction(client, this.dependencies);
        this.translatorService = new TranslatorService(botCommand, this.dependencies);
        this.commandCreatorService = new CommandCreatorService(client, this.dependencies.dataStore, mongoConnection);
        this.messageChecker = new MessageChecker();
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
        this.WatchForUserORS();
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

    private EmojiDictionary: { EmojiValue: string, RoleName: NGSRoles }[] = [
        { EmojiValue: "705186343440875560", RoleName: NGSRoles.ORSDivisionE },
        { EmojiValue: "603561788688039937", RoleName: NGSRoles.ORSDivisionD },
        { EmojiValue: "598558183530823694", RoleName: NGSRoles.ORSDivisionC },
        { EmojiValue: "617155504120266796", RoleName: NGSRoles.ORSDivisionB },
        { EmojiValue: "591636712338489349", RoleName: NGSRoles.ORSDivisionA },
        { EmojiValue: "864233991522484235", RoleName: NGSRoles.ORSDivisionNexus},
        { EmojiValue: "600663992406507520", RoleName: NGSRoles.ORSDivisionHeroic }]

    public WatchForUserORS() {
        const loadedRoles: Map<string, Role> = new Map<string, Role>();
        const specificMessageId = "1353405256981282889";
        const channelId = "1351384908186124299";
        this.client.channels.fetch(channelId).then(channel => {
            (<TextChannel>channel).messages.fetch(specificMessageId);
        });
        this.client.on('messageReactionAdd', async (reaction, user) => {
            await this.AdjustRole(specificMessageId, loadedRoles, reaction, user, "add");
        });

        this.client.on('messageReactionRemove', async (reaction, user) => {
            await this.AdjustRole(specificMessageId, loadedRoles, reaction, user, "remove");
        });
    }

    private async AdjustRole(specificMessageId: string, loadedRoles: Map<string, Role>, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, addOrRemove: "add" | "remove") {
        const message = reaction.message;
        if (message.guild?.id != DiscordGuilds.NGS || message.id != specificMessageId)
            return;
        const reactedEmojiId = reaction.emoji.id;
        if (reactedEmojiId == null)
            return;

        const guild = message.guild;
        if (!guild)
            return;

        const member = guild.members.cache.get(user.id);
        if (!member)
            return;


        const relatedEmojiIndex = this.EmojiDictionary.findIndex(item => item.EmojiValue == reactedEmojiId);
        if (relatedEmojiIndex == -1)
            return;

        const relatedEmoji = this.EmojiDictionary[relatedEmojiIndex];

        let foundRole = loadedRoles.get(reactedEmojiId);
        if (!foundRole) {
            const roleHelper = await RoleHelper.CreateFrom(guild);
            const serverRole = roleHelper.lookForRole(relatedEmoji.RoleName);
            if (!serverRole)
                return;

            foundRole = serverRole
            loadedRoles.set(reactedEmojiId, foundRole);
        }
        if (addOrRemove == "add")
            await member.roles.add(foundRole);
        else if (addOrRemove == "remove")
            await member.roles.remove(foundRole);
    }

    private async OnMessageReceived(message: Message) {
        this.translatorService.runTranslators(message);

        if (message.channel.type == ChannelType.DM && message.author.bot == false) {
            await this.pmMessageInteraction.ReceivePM(message);
        }

        this.messageChecker.Check(message);
    }
}