require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";
import { Bot } from "./bot";
import { NGSDivisions } from "./enums/NGSDivisions";
import { Globals } from "./Globals";
let bot = container.get<Bot>(TYPES.Bot);
async function sendSchedule() {
    try {
    await bot.sendSchedule();
    await bot.sendScheduleForDad();
    await bot.sendScheduleForSis();
    }
    catch (e)
    {
        Globals.log(e);
    }
    process.exit();
};
sendSchedule();