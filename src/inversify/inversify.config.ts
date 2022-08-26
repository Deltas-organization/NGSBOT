import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "../bot";
import { Client, Intents } from "discord.js";
import { CronHelper } from "../crons/cron-helper";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<CronHelper>(TYPES.CronHelper).to(CronHelper).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES] }));
if (process.env.TOKEN)
    container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
if (process.env.NGSToken)
    container.bind<string>(TYPES.ApiToken).toConstantValue(process.env.NGSToken);
if (process.env.MongoURL)
    container.bind<string>(TYPES.MongConection).toConstantValue(process.env.MongoURL);
if (process.env.BotCommand)
    container.bind<string>(TYPES.BotCommand).toConstantValue(process.env.BotCommand);

export default container;

