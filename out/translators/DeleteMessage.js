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
const DeleteMessageWorker_1 = require("../workers/DeleteMessageWorker");
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
            const worker = new DeleteMessageWorker_1.DeleteMessageWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.DeleteMessage = DeleteMessage;
//# sourceMappingURL=DeleteMessage.js.map