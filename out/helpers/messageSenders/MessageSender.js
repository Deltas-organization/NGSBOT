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
exports.MessageSender = void 0;
const MessageWrapper_1 = require("../MessageWrapper");
class MessageSender {
    constructor(client) {
        this.client = client;
    }
    SendBasicMessageToChannel(message, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            var messagesSent = [];
            while (message.length > MessageSender.maxLength) {
                let newMessage = message.slice(0, MessageSender.maxLength);
                message = message.substr(MessageSender.maxLength);
                var result = yield this.SendBasicMessageToChannel(newMessage, channel);
                messagesSent.push(...result);
            }
            var sentMessage = yield this.JustSendIt(message, channel, true);
            messagesSent.push(sentMessage);
            return messagesSent;
        });
    }
    SendMessageToChannel(message, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            while (message.length > MessageSender.maxLength) {
                const newMessage = message.slice(0, MessageSender.maxLength);
                message = message.substr(MessageSender.maxLength);
                const sentMessage = yield this.SendMessageToChannel(newMessage, channel);
                result.push(...sentMessage);
            }
            var sentMessage = yield this.JustSendIt(message, channel, false);
            const messageWrapper = new MessageWrapper_1.MessageWrapper(this, sentMessage);
            result.push(messageWrapper);
            return result;
        });
    }
    SendMessagesToChannel(messages, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let combinedMessages = this.CombineMultiple(messages);
            for (var message of combinedMessages) {
                result.push(...(yield this.SendMessageToChannel(message, channel)));
            }
            return result;
        });
    }
    Edit(message, newContent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message.edit({
                embeds: [{
                        color: 0,
                        description: newContent
                    }]
            });
        });
    }
    static SendMessageToChannel(dependencies, message, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.SendMessageToChannelThroughClient(dependencies.client, message, channelID);
        });
    }
    static SendMessageToChannelThroughClient(client, message, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            var myChannel = client.channels.cache.find(channel => channel.id == channelID);
            if (myChannel != null) {
                var sentMessage = yield myChannel.send({
                    embeds: [{
                            color: 0,
                            description: message
                        }]
                });
                return sentMessage;
            }
        });
    }
    SendMessageFromContainerToChannel(container, channel, basicMessage = false) {
        return __awaiter(this, void 0, void 0, function* () {
            var messages = container.MultiMessages(MessageSender.maxLength);
            for (var message of messages) {
                yield this.JustSendIt(message, channel, basicMessage);
            }
        });
    }
    JustSendIt(message, channel, basic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (basic)
                return yield channel.send(message);
            return yield channel.send({
                embeds: [{
                        color: 0,
                        description: message
                    }]
            });
        });
    }
    CombineMultiple(messages) {
        let result = [];
        let currentMessage = '';
        for (var message of messages) {
            if (currentMessage.length + message.length > MessageSender.maxLength) {
                result.push(currentMessage);
                currentMessage = '';
            }
            currentMessage += message;
        }
        result.push(currentMessage);
        return result;
    }
}
exports.MessageSender = MessageSender;
MessageSender.maxLength = 2000;
//# sourceMappingURL=MessageSender.js.map