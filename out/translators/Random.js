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
exports.RandomTranslator = void 0;
const translatorBase_1 = require("./bases/translatorBase");
const RandomWorker_1 = require("../workers/RandomWorker");
const fs = require('fs');
class RandomTranslator extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["random"];
    }
    get description() {
        return "Will give a random thing. Supports: Map, hero, ranged, melee, assassin, healer, support, tank, bruiser.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new RandomWorker_1.RandomWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.RandomTranslator = RandomTranslator;
//# sourceMappingURL=Random.js.map