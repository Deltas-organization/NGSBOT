"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("../bot");
const discord_js_1 = require("discord.js");
const cron_helper_1 = require("../crons/cron-helper");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.CronHelper).to(cron_helper_1.CronHelper).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client());
container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind(types_1.TYPES.ApiToken).toConstantValue(process.env.NGSToken);
container.bind(types_1.TYPES.MongConection).toConstantValue(process.env.MongoURL);
exports.default = container;
//# sourceMappingURL=inversify.config.js.map