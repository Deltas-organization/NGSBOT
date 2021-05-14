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
exports.ScheduleLister = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const Globals_1 = require("../Globals");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const ScheduleWorker_1 = require("../workers/ScheduleWorker");
class ScheduleLister extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["Schedule", "sch"];
    }
    get description() {
        return "Displays the Schedule for Today or a future date if a number is also provided, detailed (-d) will return all days betwen now and the number provided, up to 10.";
    }
    getGameMessagesForToday() {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.dataStore.GetSchedule());
            if (filteredGames.length <= 0) {
                Globals_1.Globals.log("No games available for today.");
                return;
            }
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
        });
    }
    getGameMessagesForTodayByDivision(ngsDivision) {
        return __awaiter(this, void 0, void 0, function* () {
            var filteredGames = yield ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.dataStore.GetSchedule());
            filteredGames = filteredGames.filter(f => f.divisionDisplayName == ngsDivision);
            if (filteredGames.length <= 0) {
                return;
            }
            return yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
        });
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new ScheduleWorker_1.ScheduleWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.ScheduleLister = ScheduleLister;
//# sourceMappingURL=ScheduleLister.js.map