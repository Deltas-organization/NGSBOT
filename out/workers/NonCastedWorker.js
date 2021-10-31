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
exports.NonCastedWorker = void 0;
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const WorkerBase_1 = require("./Bases/WorkerBase");
class NonCastedWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._messageCommand = (messages, _) => this.messageSender.DMMessages(messages);
            if (this.detailed) {
                this._messageCommand = (messages, storeMessage) => this.messageSender.SendMessages(messages, storeMessage);
            }
            let futureDays = 99;
            if (commands.length > 0) {
                let parsedNumber = parseInt(commands[0]);
                if (isNaN(parsedNumber)) {
                    yield this.messageSender.SendMessage(`The parameter ${commands[0]} is not a valid number`);
                    return;
                }
                futureDays = parsedNumber - 1;
            }
            let nonCastedGames = yield this.GetNonCastedGames(futureDays);
            if (nonCastedGames.length <= 0) {
                yield this.messageSender.SendMessage("All games have a caster");
            }
            else {
                let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(nonCastedGames);
                yield this._messageCommand(messages);
            }
            this.messageSender.originalMessage.delete();
        });
    }
    GetNonCastedGames(futureDays) {
        return __awaiter(this, void 0, void 0, function* () {
            let futureGames = ScheduleHelper_1.ScheduleHelper.GetGamesSorted(yield this.dataStore.GetSchedule(), futureDays);
            return futureGames.filter(game => !game.casterName);
        });
    }
}
exports.NonCastedWorker = NonCastedWorker;
//# sourceMappingURL=NonCastedWorker.js.map