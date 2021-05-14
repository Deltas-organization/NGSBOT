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
exports.GamesCommand = void 0;
const GamesWorker_1 = require("../workers/GamesWorker");
const translatorBase_1 = require("./bases/translatorBase");
class GamesCommand extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["games"];
    }
    get description() {
        return "Will Return the games for the team of the person sending the command.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new GamesWorker_1.GamesWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.GamesCommand = GamesCommand;
//# sourceMappingURL=GamesCommand.js.map