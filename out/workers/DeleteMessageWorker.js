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
exports.DeleteMessageWorker = void 0;
const WorkerBase_1 = require("./Bases/WorkerBase");
class DeleteMessageWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            let amountToDelete = 1;
            if (commands.length > 0) {
                let parsedNumber = parseInt(commands[0]);
                if (!isNaN(parsedNumber)) {
                    amountToDelete = parsedNumber;
                }
            }
            var message = (yield this.messageSender.SendMessage(`would you like me to delete my last ${amountToDelete} message${(amountToDelete > 1 && 's?') || '?'}`, false)).Message;
            message.react('✅');
            const filter = (reaction, user) => {
                return ['✅'].includes(reaction.emoji.name) && user.id === this.messageSender.originalMessage.author.id;
            };
            try {
                yield message.awaitReactions({ filter, max: 1, time: 3e4 });
                this.messageStore.DeleteMessage(amountToDelete);
                message.delete();
                this.messageSender.originalMessage.delete();
            }
            catch (_a) {
            }
        });
    }
}
exports.DeleteMessageWorker = DeleteMessageWorker;
//# sourceMappingURL=DeleteMessageWorker.js.map