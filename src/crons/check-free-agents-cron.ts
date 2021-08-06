require('dotenv').config(); // Recommended way of loading dotenv
import { Bot } from "../bot";
import container from "../inversify/inversify.config";
import { TYPES } from "../inversify/types";

let bot = container.get<Bot>(TYPES.Bot);
bot.DeleteOldMessages().then(() =>
{
    process.exit();
});