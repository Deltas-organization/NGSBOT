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
exports.DeleteMessage = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
class DeleteMessage extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["delete", "del"];
    }
    get description() {
        return "Will delete the last message sent by the bot on this server";
    }
    constructor(translatorDependencies) {
        super(translatorDependencies);
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            let amountToDelete = 1;
            if (commands.length > 0) {
                let parsedNumber = parseInt(commands[0]);
                if (!isNaN(parsedNumber)) {
                    amountToDelete = parsedNumber;
                }
            }
            var message = yield messageSender.SendMessage(`would you like me to delete my last ${amountToDelete} message${(amountToDelete > 1 && 's?') || '?'}`, false);
            message.react('✅');
            const filter = (reaction, user) => {
                return ['✅'].includes(reaction.emoji.name) && user.id === messageSender.originalMessage.author.id;
            };
            var collectedReactions = yield message.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
            if (collectedReactions.first().emoji.name === '✅') {
                this.messageStore.DeleteMessage(amountToDelete);
            }
            message.delete();
            messageSender.originalMessage.delete();
        });
    }
}
exports.DeleteMessage = DeleteMessage;
//# sourceMappingURL=DeleteMessage.js.map