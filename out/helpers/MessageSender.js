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
const MessageWrapper_1 = require("./MessageWrapper");
class MessageSender {
    constructor(client, channel, messageStore) {
        this.client = client;
        this.channel = channel;
        this.messageStore = messageStore;
        this.maxLength = 2000;
    }
    SendBasicMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            while (message.length > this.maxLength) {
                let newMessage = message.slice(0, this.maxLength);
                message = message.substr(this.maxLength);
                yield this.SendBasicMessage(newMessage);
            }
            return yield this.JustSendIt(message, true);
        });
    }
    SendMessage(message, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            while (message.length > this.maxLength) {
                let newMessage = message.slice(0, this.maxLength);
                message = message.substr(this.maxLength);
                yield this.SendMessage(newMessage, storeMessage);
            }
            var sentMessage = yield this.JustSendIt(message, false);
            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
            return new MessageWrapper_1.MessageWrapper(this, sentMessage);
        });
    }
    SendMessages(messages, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let combinedMessages = this.CombineMultiple(messages);
            for (var message of combinedMessages) {
                result.push(yield this.SendMessage(message, storeMessage));
            }
            return result;
        });
    }
    SendFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.channel.send({ files: files });
        });
    }
    DMMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let combinedMessages = this.CombineMultiple(messages);
            for (var message of combinedMessages) {
                result.push(yield this.DMMessage(message));
            }
            return result;
        });
    }
    DMMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            while (message.length > this.maxLength) {
                let newMessage = message.slice(0, this.maxLength);
                message = message.substr(this.maxLength);
                yield this.DMMessage(newMessage);
            }
            var sentMessage = yield this.JustSendIt(message, false);
            return new MessageWrapper_1.MessageWrapper(this, sentMessage);
        });
    }
    Edit(message, newContent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message.edit({
                embed: {
                    color: 0,
                    description: newContent
                }
            });
        });
    }
    SendFields(description, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.channel.send({
                embed: {
                    color: 0,
                    description: description,
                    fields: fields
                }
            });
            this.messageStore.AddMessage(sentMessage);
            return sentMessage;
        });
    }
    static SendMessageToChannel(dependencies, message, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.SendMessageToChannelThroughClient(dependencies.client, message, channelID);
            if (sentMessage)
                dependencies.messageStore.AddMessage(sentMessage);
        });
    }
    static SendMessageToChannelThroughClient(client, message, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            var myChannel = client.channels.cache.find(channel => channel.id == channelID);
            if (myChannel != null) {
                var sentMessage = yield myChannel.send({
                    embed: {
                        color: 0,
                        description: message
                    }
                });
                return sentMessage;
            }
        });
    }
    SendMessageFromContainer(container, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var messages = container.MultiMessages(this.maxLength);
            for (var message of messages) {
                var sentMessage = yield this.JustSendIt(message, false);
                if (storeMessage)
                    this.messageStore.AddMessage(sentMessage);
            }
        });
    }
    JustSendIt(message, basic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (basic)
                return yield this.channel.send(message);
            return yield this.channel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
        });
    }
    CombineMultiple(messages) {
        let result = [];
        let currentMessage = '';
        for (var message of messages) {
            if (currentMessage.length + message.length > this.maxLength) {
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
//# sourceMappingURL=MessageSender.js.map