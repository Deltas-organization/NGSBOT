require('dotenv').config(); // Recommended way of loading dotenv

import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";
import { Bot } from "./bot";
import { CreateCasterEvents } from "./crons/create-caster-event";
let bot = container.get<Bot>(TYPES.Bot);
bot.listen().then(() => {
  console.log('Logged in!');
  bot.OnInitialize();
}).catch((error) => {
  console.log('Oh no! ', error)
});

const schedule = require('node-schedule');
//Every 15 minute mark.
const job = schedule.scheduleJob('*/15 * * * *', async () => {
  var createCasterEvents = container.get<CreateCasterEvents>(TYPES.CreateCasterEvents);
  await createCasterEvents.CheckForNewCastedGames();
});