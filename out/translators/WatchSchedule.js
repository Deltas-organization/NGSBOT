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
exports.WatchSchedule = void 0;
const WatchScheduleWorker_1 = require("../workers/WatchScheduleWorker");
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
class WatchSchedule extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["watch"];
    }
    get description() {
        return "Will watch for schedules games daily and post in the channel";
    }
    get delimiter() {
        return ',';
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const watchWorker = new WatchScheduleWorker_1.WatchScheduleWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
            yield watchWorker.Begin(commands);
        });
    }
}
exports.WatchSchedule = WatchSchedule;
//# sourceMappingURL=WatchSchedule.js.map