"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Globals = void 0;
const DiscordChannels_1 = require("./enums/DiscordChannels");
class Globals {
    static log(message, ...optionalParams) {
        if (Globals.EnableLogging) {
            if (optionalParams && optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }
    static logAdvanced(message, ...optionalParams) {
        if (Globals.EnableAdvancedLogging) {
            if (optionalParams)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }
    static InformDelta(message) {
        if (this.ChannelSender)
            this.ChannelSender.SendToDiscordChannel(message, DiscordChannels_1.DiscordChannels.DeltaPmChannel);
    }
}
exports.Globals = Globals;
Globals.EnableLogging = true;
Globals.EnableAdvancedLogging = false;
//# sourceMappingURL=Globals.js.map