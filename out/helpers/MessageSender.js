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
const Globals_1 = require("../Globals");
class MessageSender {
    constructor(client, originalMessage, messageStore) {
        this.client = client;
        this.originalMessage = originalMessage;
        this.messageStore = messageStore;
    }
    get TextChannel() {
        return this.originalMessage.channel;
    }
    get Requester() {
        return this.originalMessage.member.user;
    }
    SendMessage(message, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.TextChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
            return sentMessage;
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
            var sentMessage = yield this.TextChannel.send({
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
            var myChannel = dependencies.client.channels.cache.find(channel => channel.id == channelID);
            if (myChannel != null) {
                var sentMessage = yield myChannel.send({
                    embed: {
                        color: 0,
                        description: message
                    }
                });
                dependencies.messageStore.AddMessage(sentMessage);
                return sentMessage;
            }
        });
    }
    SendReactionMessage(message, authentication, yesReaction, noReaction = () => { }, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.TextChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
            yield sentMessage.react('✅');
            yield sentMessage.react('❌');
            yield sentMessage.react('🛑');
            const members = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            const filter = (reaction, user) => {
                let member = members.find(mem => mem.id == user.id);
                return ['✅', '❌', '🛑'].includes(reaction.emoji.name) && authentication(member);
            };
            let response = null;
            try {
                var collectedReactions = yield sentMessage.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
                if (collectedReactions.first().emoji.name === '✅') {
                    yield yesReaction();
                    response = true;
                }
                if (collectedReactions.first().emoji.name === '❌') {
                    yield noReaction();
                    response = false;
                }
                if (collectedReactions.first().emoji.name === '🛑') {
                    response = null;
                }
            }
            catch (err) {
                Globals_1.Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
            }
            return { message: sentMessage, response: response };
        });
    }
}
exports.MessageSender = MessageSender;
//# sourceMappingURL=MessageSender.js.map