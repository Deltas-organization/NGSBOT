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
exports.Leave = void 0;
const LeaveWorker_1 = require("../workers/LeaveWorker");
const ngsOnlyTranslatorBase_1 = require("./bases/ngsOnlyTranslatorBase");
const fs = require('fs');
class Leave extends ngsOnlyTranslatorBase_1.NGSOnlyTranslatorBase {
    get commandBangs() {
        return ["leave"];
    }
    get description() {
        return "Will prompt user for role removals.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new LeaveWorker_1.LeaveWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.Leave = Leave;
//# sourceMappingURL=Leave.js.map