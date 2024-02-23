"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("../bot");
const discord_js_1 = require("discord.js");
const cron_helper_1 = require("../crons/cron-helper");
const create_caster_event_1 = require("../crons/create-caster-event");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.CreateCasterEvents).to(create_caster_event_1.CreateCasterEvents).inSingletonScope();
container.bind(types_1.TYPES.CronHelper).to(cron_helper_1.CronHelper).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client({ intents: [
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildScheduledEvents,
        discord_js_1.GatewayIntentBits.GuildVoiceStates
    ] }));
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