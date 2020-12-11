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
const MessageSender_1 = require("./helpers/MessageSender");
const LiveDataStore_1 = require("./LiveDataStore");
const SelfTeamChecker_1 = require("./translators/SelfTeamChecker");
const MessageStore_1 = require("./MessageStore");
const TranslatorDependencies_1 = require("./helpers/TranslatorDependencies");
const DeleteMessage_1 = require("./translators/DeleteMessage");
const CheckUsers_1 = require("./translators/CheckUsers");
const ConfigSetter_1 = require("./translators/ConfigSetter");
var fs = require('fs');
let Bot = /** @class */ (() => {
    let Bot = class Bot {
        constructor(client, token) {
            this.client = client;
            this.token = token;
            this.translators = [];
            const liveDataStore = new LiveDataStore_1.LiveDataStore();
            this.dependencies = new TranslatorDependencies_1.TranslatorDependencies(client, new MessageStore_1.MessageStore());
            this.scheduleLister = new ScheduleLister_1.ScheduleLister(this.dependencies, liveDataStore);
            this.translators.push(this.scheduleLister);
            this.translators.push(new SelfTeamChecker_1.SelfTeamChecker(this.dependencies, liveDataStore));
            this.translators.push(new CheckUsers_1.CheckUsers(this.dependencies, liveDataStore));
            this.translators.push(new DeleteMessage_1.DeleteMessage(this.dependencies));
            this.translators.push(new ConfigSetter_1.ConfigSetter(this.dependencies));
            this.translators.push(new commandLister_1.CommandLister(this.dependencies, this.translators));
        }
        listen() {
            this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                this.OnMessageReceived(message);
            }));
            return this.client.login(this.token);
        }
        OnMessageReceived(message) {
            let originalContent = message.content;
            if (/^\>/.test(originalContent)) {
                var trimmedValue = originalContent.substr(1);
                this.translators.forEach(translator => {
                    translator.Translate(trimmedValue, message);
                });
            }
        }
        sendSchedule() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.dependencies.client.login(this.token);
                let messages = yield this.scheduleLister.getGameMessagesForToday();
                if (messages) {
                    //My Test Server and NGS HypeChannel
                    let channelsToReceiveMessage = ["761410049926889544", "522574547405242389"];
                    for (var channelIndex = 0; channelIndex < channelsToReceiveMessage.length; channelIndex++) {
                        for (var index = 0; index < messages.length; index++) {
                            yield MessageSender_1.MessageSender.SendMessageToChannel(this.dependencies, messages[index], channelsToReceiveMessage[channelIndex]);
                        }
                    }
                }
            });
        }
    };
    Bot = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject(types_1.TYPES.Client)),
        __param(1, inversify_1.inject(types_1.TYPES.Token)),
        __metadata("design:paramtypes", [discord_js_1.Client, String])
    ], Bot);
    return Bot;
})();
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map