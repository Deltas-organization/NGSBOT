"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("../bot");
const discord_js_1 = require("discord.js");
const NGSDataStore_1 = require("../NGSDataStore");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client());
container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind(types_1.TYPES.NGSDataStore).toConstantValue(new NGSDataStore_1.NGSDataStore());
exports.default = container;
//# sourceMappingURL=inversify.config.js.map