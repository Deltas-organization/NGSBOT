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
require('dotenv').config(); // Recommended way of loading dotenv
const inversify_config_1 = require("./inversify/inversify.config");
const types_1 = require("./inversify/types");
const Globals_1 = require("./Globals");
let cronHelper = inversify_config_1.default.get(types_1.TYPES.CronHelper);
function sendSchedule() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cronHelper.sendSchedule();
            yield cronHelper.sendScheduleForDad();
            yield cronHelper.sendScheduleForMom();
            yield cronHelper.sendScheduleForSis();
        }
        catch (e) {
            Globals_1.Globals.log(e);
        }
        process.exit();
    });
}
;
sendSchedule();
//# sourceMappingURL=schedule-cron.js.map