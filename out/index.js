"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config(); // Recommended way of loading dotenv
const inversify_config_1 = require("./inversify/inversify.config");
const types_1 = require("./inversify/types");
let bot = inversify_config_1.default.get(types_1.TYPES.Bot);
bot.listen().then(() => {
    console.log('Logged in!');
}).catch((error) => {
    console.log('Oh no! ', error);
});
var ipc = require('node-ipc');
ipc.config.id = 'NGSBOT';
ipc.config.retry = 1500;
ipc.connectTo("NGSBotServer", function () {
    ipc.of.NGSBotServer.on('message', //any event or message type your server listens for
    function (data) {
        console.log('got a message from world : ' + data);
    });
});
//# sourceMappingURL=index.js.map