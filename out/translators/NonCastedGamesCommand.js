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
exports.NonCastedGamesCommand = void 0;
const NonCastedWorker_1 = require("../workers/NonCastedWorker");
const translatorBase_1 = require("./bases/translatorBase");
class NonCastedGamesCommand extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["noncasted"];
    }
    get description() {
        return "Will Return the games that don't currently have a caster. Can Specify a number to clamp the result within that number of days in the future.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new NonCastedWorker_1.NonCastedWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.NonCastedGamesCommand = NonCastedGamesCommand;
//# sourceMappingURL=NonCastedGamesCommand.js.map