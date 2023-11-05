"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageChecker = void 0;
const DiscordChannels_1 = require("./enums/DiscordChannels");
class MessageChecker {
    Check(message) {
        if (message.channel.id == DiscordChannels_1.DiscordChannels.NGSFlipChannel) {
        }
    }
}
exports.MessageChecker = MessageChecker;
//# sourceMappingURL=messageChecker.js.map