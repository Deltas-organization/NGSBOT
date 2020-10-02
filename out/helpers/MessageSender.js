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
class MessageSender {
    constructor(client, originalMessage) {
        this.client = client;
        this.originalMessage = originalMessage;
    }
    get TextChannel() {
        return this.originalMessage.channel;
    }
    get Mentions() {
        return this.originalMessage.mentions;
    }
    SendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.TextChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
        });
    }
    SendFields(description, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.TextChannel.send({
                embed: {
                    color: 0,
                    description: description,
                    fields: fields
                }
            });
        });
    }
    SendMessageToChannel(message, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            var myChannel = this.originalMessage.guild.channels.cache.find(channel => channel.id == channelID);
            yield myChannel.send(message);
        });
    }
}
exports.MessageSender = MessageSender;
//# sourceMappingURL=MessageSender.js.map