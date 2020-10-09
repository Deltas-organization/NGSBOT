require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import {TYPES} from "./inversify/types";
import {Bot} from "./bot";
let bot = container.get<Bot>(TYPES.Bot);
bot.sendSchedule().then(() =>
{
    process.exit();
})