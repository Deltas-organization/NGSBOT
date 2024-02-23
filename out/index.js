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
let bot = inversify_config_1.default.get(types_1.TYPES.Bot);
bot.listen().then(() => {
    console.log('Logged in!');
    bot.OnInitialize();
}).catch((error) => {
    console.log('Oh no! ', error);
});
const schedule = require('node-schedule');
//Every 15 minute mark.
const job = schedule.scheduleJob('*/15 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    var createCasterEvents = inversify_config_1.default.get(types_1.TYPES.CreateCasterEvents);
    yield createCasterEvents.CheckForNewCastedGames();
}));
//# sourceMappingURL=index.js.map