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
exports.CronRunner = void 0;
require('dotenv').config(); // Recommended way of loading dotenv
const inversify_config_1 = require("../inversify/inversify.config");
const types_1 = require("../inversify/types");
const cronHelper = inversify_config_1.default.get(types_1.TYPES.CronHelper);
class CronRunner {
    constructor() {
    }
    static Process(processArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (processArgs.length !== 3)
                return;
            const runner = new CronRunner();
            switch (processArgs[2].toLowerCase()) {
                case "schedule":
                    yield runner.SendSchedule();
                    break;
                case "history":
                    yield cronHelper.CheckHistory();
                    break;
                case "check":
                    yield cronHelper.CheckReportedGames();
                    break;
                case "nextweek":
                    yield cronHelper.CheckSundaysUnScheduledGames();
                    break;
                case "flex":
                    yield cronHelper.CheckFlexMatches();
                    break;
                case "pendingmembers":
                    yield cronHelper.MessageAboutPendingMembers();
                    break;
            }
            process.exit();
        });
    }
    SendSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            yield cronHelper.sendSchedule();
            yield cronHelper.sendRequestedSchedules();
        });
    }
}
exports.CronRunner = CronRunner;
CronRunner.Process(process.argv);
//# sourceMappingURL=cron-runner.js.map