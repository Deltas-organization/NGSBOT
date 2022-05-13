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
exports.RespondToMessageHelper = void 0;
const Globals_1 = require("../Globals");
const MessageSender_1 = require("./MessageSender");
class RespondToMessageHelper extends MessageSender_1.MessageSender {
    constructor(client, originalMessage, messageStore) {
        super(client, originalMessage.channel, messageStore);
        this.originalMessage = originalMessage;
    }
    get GuildMember() {
        return this.originalMessage.member;
    }
    get Requester() {
        return this.GuildMember.user;
    }
    SendReactionMessage(message, authentication, yesReaction, noReaction = () => { }, storeMessage = true) {
        return __awaiter(this, void 0, void 0, function* () {
            var sentMessage = yield this.channel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
            if (storeMessage)
                this.messageStore.AddMessage(sentMessage);
            yield sentMessage.react('✅');
            yield sentMessage.react('❌');
            const guildMembers = this.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            const filter = (reaction, user) => {
                let member = guildMembers.find(mem => mem.id == user.id);
                return ['✅', '❌'].includes(reaction.emoji.name) && authentication(member);
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
            }
            catch (err) {
                Globals_1.Globals.log(`There was a problem with reaction message: ${message}. Error: ${err}`);
            }
            return { message: sentMessage, response: response };
        });
    }
}
exports.RespondToMessageHelper = RespondToMessageHelper;
//# sourceMappingURL=RespondToMessageHelper.js.map