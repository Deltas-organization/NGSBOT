require('dotenv').config(); // Recommended way of loading dotenv
import container from "../inversify/inversify.config";
import { TYPES } from "../inversify/types";
import { Bot } from "../bot";
import { Globals } from "../Globals";
let bot = container.get<Bot>(TYPES.Bot);
bot.CreateCaptainList().then(() =>
{
    process.exit();
});