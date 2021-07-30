"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckFreeAgentsCommand = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const moment = require("moment-timezone");
const Globals_1 = require("../Globals");
class CheckFreeAgentsCommand {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    MessageFreeAgents(pastDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.DeltaServer);
            let messages = (yield guildChannel.messages.fetch({ limit: 10 })).map((message, _, __) => message);
            const currentDate = moment();
            console.log(currentDate);
            let messagesToDelete = [];
            for (var message of messages) {
                let momentDate = moment(message.createdTimestamp);
                console.log(currentDate.diff(momentDate, 'days'));
                if (!message.pinned) {
                    messagesToDelete.push(message);
                }
            }
            try {
                yield guildChannel.bulkDelete(messagesToDelete);
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
    GetChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(channelId, false));
            return channel;
        });
    }
}
exports.CheckFreeAgentsCommand = CheckFreeAgentsCommand;
//# sourceMappingURL=CheckFreeAgentsCommand.js.map