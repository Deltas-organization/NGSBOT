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
exports.RespondToMessageSender = void 0;
const Globals_1 = require("../../Globals");
const MessageSender_1 = require("./MessageSender");
class RespondToMessageSender extends MessageSender_1.MessageSender {
    constructor(client, originalMessage, messageStore) {
        super(client, messageStore);
        this.originalMessage = originalMessage;
    }
    get Channel() {
        return this.originalMessage.channel;
    }
    get GuildMember() {
        return this.originalMessage.member;
    }
    get Requester() {
        var _a;
        return (_a = this.GuildMember) === null || _a === void 0 ? void 0 : _a.user;
    }
    SendReactionMessage(message, authentication, yesReaction, noReaction = () => { }, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.Channel.send({
                embeds: [{
                        color: 'DEFAULT',
                        description: message
                    }]
            });
            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
            yield sentMessage.react('✅');
            yield sentMessage.react('❌');
            if (!this.originalMessage.guild)
                return;
            const guildMembers = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            const filter = (reaction, user) => {
                let member = guildMembers.find(mem => mem.id == user.id);
                return ['✅', '❌'].includes(reaction.emoji.name) && authentication(member);
            };
            let response = null;
            try {
                var collectedReactions = yield sentMessage.awaitReactions({ filter, max: 1, time: 3e4, errors: ['time'] });
                var first = collectedReactions.first();
                if (first) {
                    if (first.emoji.name === '✅') {
                        yield yesReaction();
                        response = true;
                    }
                    if (first.emoji.name === '❌') {
                        yield noReaction();
                        response = false;
                    }
                }
            }
            catch (err) {
                Globals_1.Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
            }
            return { message: sentMessage, response: response };
        });
    }
    SendFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.Channel.send({ files: files });
        });
    }
    SendFields(description, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.Channel.send({
                embeds: [{
                        color: "DEFAULT",
                        description: description,
                        fields: fields
                    }]
            });
            this.messageStore.AddMessage(sentMessage);
            return sentMessage;
        });
    }
    SendBasicMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.SendBasicMessageToChannel(message, this.Channel);
        });
    }
    SendMessage(message, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.SendMessageToChannel(message, this.Channel, storeMessage);
        });
    }
    SendMessages(messages, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.SendMessagesToChannel(messages, this.Channel, storeMessage);
        });
    }
    DMMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.GuildMember) {
                var channel = yield this.GuildMember.createDM();
                return yield this.SendMessageToChannel(message, channel, false);
            }
        });
    }
    DMMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.GuildMember) {
                var channel = yield this.GuildMember.createDM();
                return yield this.SendMessagesToChannel(messages, channel, false);
            }
        });
    }
    SendMessageFromContainer(messageContainer, basic = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.SendMessageFromContainerToChannel(messageContainer, this.Channel, basic);
        });
    }
}
exports.RespondToMessageSender = RespondToMessageSender;
//# sourceMappingURL=RespondToMessageSender.js.map