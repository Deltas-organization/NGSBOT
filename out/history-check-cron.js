"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config(); // Recommended way of loading dotenv
const inversify_config_1 = require("./inversify/inversify.config");
const types_1 = require("./inversify/types");
const cronHelper = inversify_config_1.default.get(types_1.TYPES.CronHelper);
cronHelper.CheckHistory().then(() => {
    process.exit();
});
//# sourceMappingURL=history-check-cron.js.map