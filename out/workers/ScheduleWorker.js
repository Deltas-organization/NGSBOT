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
exports.ScheduleWorker = void 0;
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const WorkerBase_1 = require("./Bases/WorkerBase");
class ScheduleWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            let duration = 1;
            if (commands.length == 1) {
                let parsedNumber = parseInt(commands[0]);
                if (isNaN(parsedNumber)) {
                    yield this.SearchByDivision(commands);
                    return;
                }
                if (parsedNumber > 10) {
                    yield this.messageSender.SendMessage(`the value provided is above 10 ${commands[0]}`);
                    return;
                }
                duration = parsedNumber;
            }
            else if (commands.length == 2) {
                yield this.SearchByDivision(commands);
                return;
            }
            let filteredGames = yield ScheduleHelper_1.ScheduleHelper.GetGamesSorted(yield this.dataStore.GetScheduledGames(), duration);
            let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(filteredGames);
            if (messages.length <= 0) {
                messages.push("Couldn't find any scheduled Games");
            }
            for (const message of messages) {
                yield this.messageSender.SendMessage(message);
            }
            yield this.messageSender.originalMessage.delete();
        });
    }
    SearchByDivision(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            var division = commands[0];
            if (commands.length == 2) {
                var coast = commands[1];
                if (coast.toLowerCase() == "ne")
                    division += "-northeast";
                else if (coast.toLowerCase() == "se")
                    division += "-southeast";
                else
                    division += `-${coast}`;
            }
            let scheduledGames = yield yield ScheduleHelper_1.ScheduleHelper.GetGamesSorted(yield this.dataStore.GetScheduledGames());
            scheduledGames = scheduledGames.filter(s => {
                if (!s.divisionConcat.startsWith(division))
                    return false;
                return true;
            });
            if (scheduledGames.length > 0) {
                let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(scheduledGames);
                yield this.messageSender.SendMessages(messages);
            }
            else {
                yield this.messageSender.SendBasicMessage("didn't find anything on the schedule");
            }
        });
    }
}
exports.ScheduleWorker = ScheduleWorker;
//# sourceMappingURL=ScheduleWorker.js.map