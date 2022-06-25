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
exports.SeasonInformation = void 0;
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
const SeasonInformationWorker_1 = require("../workers/SeasonInformationWorker");
class SeasonInformation extends deltaTranslatorBase_1.DeltaTranslatorBase {
    get commandBangs() {
        return ["season"];
    }
    get description() {
        return "Will return basic season information";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new SeasonInformationWorker_1.SeasonInformationWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.SeasonInformation = SeasonInformation;
//# sourceMappingURL=SeasonInformation.js.map