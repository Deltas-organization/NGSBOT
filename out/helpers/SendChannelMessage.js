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
exports.SendChannelMessage = void 0;
class SendChannelMessage {
    constructor(client, messageStore) {
        this.client = client;
        this.messageStore = messageStore;
    }
    SendMessageToChannel(message, channelToSendTo) {
        return __awaiter(this, void 0, void 0, function* () {
            var myChannel = this.client.channels.cache.find(channel => channel.id == channelToSendTo);
            if (myChannel != null) {
                while (message.length > 2048) {
                    let newMessage = message.slice(0, 2048);
                    message = message.substr(2048);
                    yield this.SendMessage(myChannel, newMessage);
                }
                yield this.SendMessage(myChannel, message);
            }
        });
    }
    SendMessage(myChannel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield myChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            this.messageStore.AddMessage(sentMessage);
            return sentMessage;
        });
    }
}
exports.SendChannelMessage = SendChannelMessage;
//# sourceMappingURL=SendChannelMessage.js.map