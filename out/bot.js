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
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const inversify_1 = require("inversify");
const types_1 = require("./inversify/types");
const LiveDataStore_1 = require("./LiveDataStore");
const TranslatorDependencies_1 = require("./helpers/TranslatorDependencies");
const DiscordChannels_1 = require("./enums/DiscordChannels");
const AssignNewUserCommand_1 = require("./commands/AssignNewUserCommand");
const DataStoreWrapper_1 = require("./helpers/DataStoreWrapper");
const NGSRoles_1 = require("./enums/NGSRoles");
const RoleHelper_1 = require("./helpers/RoleHelper");
const MessageContainer_1 = require("./message-helpers/MessageContainer");
const ChannelMessageSender_1 = require("./helpers/messageSenders/ChannelMessageSender");
const PmMessageInteraction_1 = require("./message-helpers/PmMessageInteraction");
const TranslatorService_1 = require("./translators/core/TranslatorService");
const Globals_1 = require("./Globals");
const CommandCreatorService_1 = require("./SlashCommands/CommandCreatorService");
const messageChecker_1 = require("./messageChecker");
const DiscordGuilds_1 = require("./enums/DiscordGuilds");
let Bot = class Bot {
    constructor(client, token, apiToken, mongoConnection, botCommand) {
        this.client = client;
        this.token = token;
        this.EmojiDictionary = [
            { EmojiValue: "705186343440875560", RoleName: NGSRoles_1.NGSRoles.DivisionE },
            { EmojiValue: "603561788688039937", RoleName: NGSRoles_1.NGSRoles.DivisionD },
            { EmojiValue: "598558183530823694", RoleName: NGSRoles_1.NGSRoles.DivisionC },
            { EmojiValue: "617155504120266796", RoleName: NGSRoles_1.NGSRoles.DivisionB },
            { EmojiValue: "591636712338489349", RoleName: NGSRoles_1.NGSRoles.DivisionA },
            { EmojiValue: "600663992406507520", RoleName: NGSRoles_1.NGSRoles.DivisionHeroic }
        ];
        this.dependencies = new TranslatorDependencies_1.CommandDependencies(client, new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken)), apiToken, mongoConnection);
        this.messageSender = new ChannelMessageSender_1.ChannelMessageSender(client);
        this.pmMessageInteraction = new PmMessageInteraction_1.PmMessageInteraction(client, this.dependencies);
        this.translatorService = new TranslatorService_1.TranslatorService(botCommand, this.dependencies);
        this.commandCreatorService = new CommandCreatorService_1.CommandCreatorService(client, this.dependencies.dataStore, mongoConnection);
        this.messageChecker = new messageChecker_1.MessageChecker();
        Globals_1.Globals.ChannelSender = this.messageSender;
    }
    listen() {
        this.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            yield this.OnMessageReceived(message);
        }));
        return this.client.login(this.token);
    }
    OnInitialize() {
        this.WatchForUserJoin();
        this.WatchForUserFreeAgent();
        this.WatchForUserORS();
    }
    WatchForUserJoin() {
        this.client.on('guildMemberAdd', (member) => __awaiter(this, void 0, void 0, function* () {
            let newUserCommand = new AssignNewUserCommand_1.AssignNewUserCommand(this.dependencies);
            let message = yield newUserCommand.AssignUser(member);
            if (message) {
                var messageGroup = message.MessageGroup;
                var messageContainer = new MessageContainer_1.MessageContainer();
                messageContainer.Append(messageGroup);
                if (message.FoundTeam) {
                    yield this.messageSender.SendToDiscordChannel(messageContainer.SingleMessage, DiscordChannels_1.DiscordChannels.NGSDiscord);
                }
                yield this.messageSender.SendToDiscordChannel(messageContainer.SingleMessage, DiscordChannels_1.DiscordChannels.DeltaServer);
            }
        }));
    }
    WatchForUserFreeAgent() {
        let freeAgentRole;
        this.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.channel.id == DiscordChannels_1.DiscordChannels.NGSFreeAgents) {
                if (freeAgentRole == null) {
                    if (message.guild) {
                        const roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(message.guild);
                        freeAgentRole = roleHelper.lookForRole(NGSRoles_1.NGSRoles.FreeAgents);
                    }
                }
                if (message.member)
                    message.member.roles.add(freeAgentRole);
            }
        }));
    }
    WatchForUserORS() {
        const loadedRoles = new Map();
        const specificMessageId = "1353405256981282889";
        const channelId = "1351384908186124299";
        this.client.channels.fetch(channelId).then(channel => {
            channel.messages.fetch(specificMessageId);
        });
        this.client.on('messageReactionAdd', (reaction, user) => __awaiter(this, void 0, void 0, function* () {
            yield this.AdjustRole(specificMessageId, loadedRoles, reaction, user, "add");
        }));
        this.client.on('messageReactionRemove', (reaction, user) => __awaiter(this, void 0, void 0, function* () {
            yield this.AdjustRole(specificMessageId, loadedRoles, reaction, user, "remove");
        }));
    }
    AdjustRole(specificMessageId, loadedRoles, reaction, user, addOrRemove) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const message = reaction.message;
            if (((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id) != DiscordGuilds_1.DiscordGuilds.NGS || message.id != specificMessageId)
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
                const roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(guild);
                const serverRole = roleHelper.lookForRole(relatedEmoji.RoleName);
                if (!serverRole)
                    return;
                foundRole = serverRole;
                loadedRoles.set(reactedEmojiId, foundRole);
            }
            if (addOrRemove == "add")
                yield member.roles.add(foundRole);
            else if (addOrRemove == "remove")
                yield member.roles.remove(foundRole);
        });
    }
    OnMessageReceived(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.translatorService.runTranslators(message);
            if (message.channel.type == discord_js_1.ChannelType.DM && message.author.bot == false) {
                yield this.pmMessageInteraction.ReceivePM(message);
            }
            this.messageChecker.Check(message);
        });
    }
};
Bot = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.Client)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.Token)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ApiToken)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.MongConection)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.BotCommand)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, String, String, String])
], Bot);
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map