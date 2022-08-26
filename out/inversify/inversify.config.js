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
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MEMBERS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES] }));
if (process.env.TOKEN)
    container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
if (process.env.NGSToken)
    container.bind(types_1.TYPES.ApiToken).toConstantValue(process.env.NGSToken);
if (process.env.MongoURL)
    container.bind(types_1.TYPES.MongConection).toConstantValue(process.env.MongoURL);
if (process.env.BotCommand)
    container.bind(types_1.TYPES.BotCommand).toConstantValue(process.env.BotCommand);
exports.default = container;
//# sourceMappingURL=inversify.config.js.map