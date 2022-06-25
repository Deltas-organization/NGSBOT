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
const ScheduleLister_1 = require("./translators/ScheduleLister");
const commandLister_1 = require("./translators/commandLister");
const LiveDataStore_1 = require("./LiveDataStore");
const MessageStore_1 = require("./MessageStore");
const TranslatorDependencies_1 = require("./helpers/TranslatorDependencies");
const DeleteMessage_1 = require("./translators/DeleteMessage");
const ConfigSetter_1 = require("./translators/ConfigSetter");
const SearchPlayers_1 = require("./translators/SearchPlayers");
const TeamChecker_1 = require("./translators/TeamChecker");
const AssignRoles_1 = require("./translators/AssignRoles");
const RegisteredCount_1 = require("./translators/RegisteredCount");
const Purge_1 = require("./translators/Purge");
const DiscordChannels_1 = require("./enums/DiscordChannels");
const Reload_1 = require("./translators/Reload");
const GamesCommand_1 = require("./translators/GamesCommand");
const NonCastedGamesCommand_1 = require("./translators/NonCastedGamesCommand");
const AssignNewUserCommand_1 = require("./commands/AssignNewUserCommand");
const DataStoreWrapper_1 = require("./helpers/DataStoreWrapper");
const Leave_1 = require("./translators/Leave");
const UnusedRoles_1 = require("./translators/UnusedRoles");
const UpdateCaptainsList_1 = require("./translators/UpdateCaptainsList");
const NGSRoles_1 = require("./enums/NGSRoles");
const RoleHelper_1 = require("./helpers/RoleHelper");
const WatchSchedule_1 = require("./translators/WatchSchedule");
const SelfAssignRolesCreator_1 = require("./translators/mongo/SelfAssignRolesCreator");
const SelfAssignRolesWatcher_1 = require("./translators/mongo/SelfAssignRolesWatcher");
const SelfAssignRolesRemover_1 = require("./translators/mongo/SelfAssignRolesRemover");
const CoinFlip_1 = require("./translators/CoinFlip");
const Random_1 = require("./translators/Random");
const TestTranslator_1 = require("./translators/TestTranslator");
const Cleanup_1 = require("./translators/Cleanup");
const MessageContainer_1 = require("./message-helpers/MessageContainer");
const ChannelMessageSender_1 = require("./helpers/messageSenders/ChannelMessageSender");
const SeasonInformation_1 = require("./translators/SeasonInformation");
let Bot = /** @class */ (() => {
    let Bot = class Bot {
        constructor(client, token, apiToken, mongoConnection, botCommand) {
            this.client = client;
            this.token = token;
            this.translators = [];
            this.exclamationTranslators = [];
            this.dependencies = new TranslatorDependencies_1.CommandDependencies(client, new MessageStore_1.MessageStore(), new DataStoreWrapper_1.DataStoreWrapper(new LiveDataStore_1.LiveDataStore(apiToken)), apiToken, mongoConnection);
            this.messageSender = new ChannelMessageSender_1.ChannelMessageSender(client, this.dependencies.messageStore);
            this.botCommand = botCommand;
            this.scheduleLister = new ScheduleLister_1.ScheduleLister(this.dependencies);
            this.translators.push(this.scheduleLister);
            this.translators.push(new DeleteMessage_1.DeleteMessage(this.dependencies));
            this.translators.push(new ConfigSetter_1.ConfigSetter(this.dependencies));
            this.translators.push(new SearchPlayers_1.SearchPlayers(this.dependencies));
            this.translators.push(new TeamChecker_1.TeamNameChecker(this.dependencies));
            this.translators.push(new AssignRoles_1.AssignRoles(this.dependencies));
            this.translators.push(new RegisteredCount_1.RegisteredCount(this.dependencies));
            this.translators.push(new Purge_1.Purge(this.dependencies));
            this.translators.push(new Reload_1.Reload(this.dependencies));
            this.translators.push(new GamesCommand_1.GamesCommand(this.dependencies));
            this.translators.push(new NonCastedGamesCommand_1.NonCastedGamesCommand(this.dependencies));
            this.translators.push(new Leave_1.Leave(this.dependencies));
            this.translators.push(new UnusedRoles_1.UnUsedRoles(this.dependencies));
            this.translators.push(new UpdateCaptainsList_1.UpdateCaptainsList(this.dependencies));
            this.translators.push(new WatchSchedule_1.WatchSchedule(this.dependencies));
            this.translators.push(new SelfAssignRolesCreator_1.SelfAssignRolesCreator(this.dependencies));
            this.translators.push(new SelfAssignRolesRemover_1.SelfAssignRolesRemover(this.dependencies));
            this.translators.push(new Random_1.RandomTranslator(this.dependencies));
            this.translators.push(new TestTranslator_1.TestTranslator(this.dependencies));
            this.translators.push(new Cleanup_1.CleanupTranslator(this.dependencies));
            this.translators.push(new SeasonInformation_1.SeasonInformation(this.dependencies));
            this.translators.push(new commandLister_1.CommandLister(this.dependencies, this.translators));
            this.exclamationTranslators.push(new SelfAssignRolesWatcher_1.SelfAssignRolesWatcher(this.dependencies));
            this.exclamationTranslators.push(new CoinFlip_1.CoinFlip(this.dependencies));
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
                this.checkTranslators(message);
                if (message.channel.type == "dm" && message.author.bot == false) {
                    yield this.messageSender.SendToDiscordChannel(`Message From ${message.author.username}: \n \n ${message.content}`, DiscordChannels_1.DiscordChannels.DeltaPmChannel);
                }
            });
        }
        checkTranslators(message) {
            let originalContent = message.content;
            const command = this.botCommand;
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