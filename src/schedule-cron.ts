require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";
import { Bot } from "./bot";
import { NGSDivisions } from "./enums/NGSDivisions";
let bot = container.get<Bot>(TYPES.Bot);
async function sendSchedule() {
    await bot.sendSchedule();
    await bot.sendScheduleForDad();
    await bot.sendScheduleForMom();
    await bot.sendScheduleForSis();
    process.exit();
};
sendSchedule();