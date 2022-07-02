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
const MessageStore_1 = require("./MessageStore");
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
let Bot = /** @class */ (() => {
    let Bot = class Bot {
        constructor(client, token, apiToken, mongoConnection, botCommand) {
            this.client = client;
            this.token = token;
            this.dependencies = new TranslatorDependencies_1.CommandDependencies(client, new MessageStore_1.MessageStore(), new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken)), apiToken, mongoConnection);
            this.messageSender = new ChannelMessageSender_1.ChannelMessageSender(client, this.dependencies.messageStore);
            this.pmMessageInteraction = new PmMessageInteraction_1.PmMessageInteraction(client, this.dependencies);
            this.translatorService = new TranslatorService_1.TranslatorService(botCommand, this.dependencies);
        }
        listen() {
            this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                yield this.OnMessageReceived(message);
            }));
            return this.client.login(this.token);
        }
        OnInitialize() {
            this.WatchForUserJoin();
            this.WatchForUserFreeAgent();
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
            this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                if (message.channel.id == DiscordChannels_1.DiscordChannels.NGSFreeAgents) {
                    if (freeAgentRole == null) {
                        const roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(message.guild);
                        freeAgentRole = roleHelper.lookForRole(NGSRoles_1.NGSRoles.FreeAgents);
                    }
                    message.member.roles.add(freeAgentRole);
                }
            }));
        }
        OnMessageReceived(message) {
            return __awaiter(this, void 0, void 0, function* () {
                this.translatorService.runTranslators(message);
                if (message.channel.type == "dm" && message.author.bot == false) {
                    yield this.pmMessageInteraction.ReceivePM(message);
                }
            });
        }
    };
    Bot = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject(types_1.TYPES.Client)),
        __param(1, inversify_1.inject(types_1.TYPES.Token)),
        __param(2, inversify_1.inject(types_1.TYPES.ApiToken)),
        __param(3, inversify_1.inject(types_1.TYPES.MongConection)),
        __param(4, inversify_1.inject(types_1.TYPES.BotCommand)),
        __metadata("design:paramtypes", [discord_js_1.Client, String, String, String, String])
    ], Bot);
    return Bot;
})();
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map