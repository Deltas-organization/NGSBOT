import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "../bot";
import { Client, GatewayIntentBits } from "discord.js";
import { CronHelper } from "../crons/cron-helper";
import { CreateCasterEvents } from "../crons/create-caster-event";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<CreateCasterEvents>(TYPES.CreateCasterEvents).to(CreateCasterEvents).inSingletonScope();
container.bind<CronHelper>(TYPES.CronHelper).to(CronHelper).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client({ intents: [
    GatewayIntentBits.DirectMessages, 
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates] }));
if (process.env.TOKEN)
    container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
if (process.env.NGSToken)
    container.bind<string>(TYPES.ApiToken).toConstantValue(process.env.NGSToken);
if (process.env.MongoURL)
    container.bind<string>(TYPES.MongConection).toConstantValue(process.env.MongoURL);
if (process.env.BotCommand)
    container.bind<string>(TYPES.BotCommand).toConstantValue(process.env.BotCommand);

export default container;

