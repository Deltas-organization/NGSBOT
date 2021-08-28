require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";
import { Bot } from "./bot";
let bot = container.get<Bot>(TYPES.Bot);
bot.listen().then(() => {
  console.log('Logged in!');
  bot.OnInitialize();
}).catch((error) => {
  console.log('Oh no! ', error)
});