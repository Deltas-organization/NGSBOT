import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "../bot";
import {Client} from "discord.js";
import { NGSDataStore } from "../NGSDataStore";
import { NGSScheduleDataStore } from "../NGSScheduleDataStore";



let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<NGSDataStore>(TYPES.NGSDataStore).toConstantValue(new NGSDataStore());
container.bind<NGSScheduleDataStore>(TYPES.NGSScheduleDataStore).toConstantValue(new NGSScheduleDataStore());

export default container;

