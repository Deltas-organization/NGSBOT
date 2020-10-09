"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config(); // Recommended way of loading dotenv
const inversify_config_1 = require("./inversify/inversify.config");
const types_1 = require("./inversify/types");
let bot = inversify_config_1.default.get(types_1.TYPES.Bot);
bot.sendSchedule().then(() => {
    process.exit();
});
//# sourceMappingURL=schedule-cron copy.js.map