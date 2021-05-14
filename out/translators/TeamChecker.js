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
exports.TeamNameChecker = void 0;
const TeamCheckerWorker_1 = require("../workers/TeamCheckerWorker");
const nonNGSTranslatorBase_1 = require("./bases/nonNGSTranslatorBase");
class TeamNameChecker extends nonNGSTranslatorBase_1.NonNGSTranslatorBase {
    get commandBangs() {
        return ["team"];
    }
    get description() {
        return "Will List Teams containing the values, Supports multiple searches with the space delimeter. And can include spaces by wraping the search in double quotes.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new TeamCheckerWorker_1.TeamCheckerWorker(this.translatorDependencies, detailed, message);
            yield worker.Begin(commands);
        });
    }
}
exports.TeamNameChecker = TeamNameChecker;
//# sourceMappingURL=TeamChecker.js.map