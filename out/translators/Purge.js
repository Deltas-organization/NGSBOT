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
exports.Purge = void 0;
const PurgeWorker_1 = require("../workers/PurgeWorker");
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const fs = require('fs');
class Purge extends ngsTranslatorBase_1.ngsTranslatorBase {
    get commandBangs() {
        return ["purge"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new PurgeWorker_1.PurgeWorker(this.translatorDependencies, detailed, messageSender, this.CreateMongoHelper());
            yield worker.Begin(commands);
        });
    }
}
exports.Purge = Purge;
//# sourceMappingURL=Purge.js.map