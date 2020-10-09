require('dotenv').config(); // Recommended way of loading dotenv
import container from "./inversify/inversify.config";
import {TYPES} from "./inversify/types";
import {Bot} from "./bot";
let bot = container.get<Bot>(TYPES.Bot);
bot.listen().then(() => {
  console.log('Logged in!')
}).catch((error) => {
  console.log('Oh no! ', error)
});

var ipc=require('node-ipc');
 
ipc.config.id = 'NGSBOT';
ipc.config.retry= 1500;

ipc.connectTo(
    "NGSBotServer",
    function(){
         ipc.of.NGSBotServer.on(
            'message',  //any event or message type your server listens for
            function(data){
              console.log('got a message from world : ' + data);
            }
        );
    }
);