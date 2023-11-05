"use strict";
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
exports.ChannelMessageSender = void 0;
const MessageSender_1 = require("./MessageSender");
class ChannelMessageSender extends MessageSender_1.MessageSender {
    constructor(client) {
        super(client);
    }
    SendToDiscordChannel(message, channel, crosspost = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const myChannel = yield this.FindChannel(channel);
                var wrappers = yield this.SendMessageToChannel(message, myChannel);
                for (let wrapper of wrappers) {
                    if (crosspost && wrapper.Message.crosspostable) {
                        yield wrapper.Message.crosspost();
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    SendToDiscordChannelAsBasic(message, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const myChannel = yield this.FindChannel(channel);
            return yield this.SendBasicMessageToChannel(message, myChannel);
        });
    }
    SendFromContainerToDiscordChannel(container, channel, basic = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const myChannel = yield this.FindChannel(channel);
            return yield this.SendMessageFromContainerToChannel(container, myChannel, basic);
        });
    }
    OverwriteBasicMessage(newMessageText, messageId, messageChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            const myChannel = yield this.client.channels.fetch(messageChannel);
            const message = yield myChannel.messages.fetch(messageId);
            yield message.edit(newMessageText);
        });
    }
    FindChannel(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.channels.fetch(channel);
        });
    }
}
exports.ChannelMessageSender = ChannelMessageSender;
//# sourceMappingURL=ChannelMessageSender.js.map