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
class CheckFreeAgentsCommand {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    DeleteOldMessages(pastDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.DeltaServer);
            let messagesToDelete = yield this.GetMessagesToDelete(pastDayCount, guildChannel);
            for (var message of messagesToDelete) {
                console.log("deleting");
                yield message.delete();
            }
            // while (messagesToDelete.length == 100) {
            //     try {
            //         await guildChannel.bulkDelete(messagesToDelete);
            //     }
            //     catch (e) {
            //         Globals.log(e);
            //     }
            //     messagesToDelete = await this.GetMessagesToDelete(pastDayCount, guildChannel);
            // }
        });
    }
    GetMessagesToDelete(pastDayCount, guildChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            let limit = 100;
            let messages = (yield guildChannel.messages.fetch({ limit })).map((message, _, __) => message);
            let messagesToDelete = this.GetMessageOlderThen(pastDayCount, messages);
            while (messagesToDelete.length < limit) {
                messages = (yield guildChannel.messages.fetch({ limit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
                messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastDayCount, messages));
                if (messages.length < limit)
                    break;
            }
            return messagesToDelete;
        });
    }
    GetMessageOlderThen(days, messages) {
        const currentDate = moment();
        let messagesToDelete = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            const dateDifference = currentDate.diff(momentDate, 'days');
            if (dateDifference > days) {
                if (!message.pinned) {
                    messagesToDelete.push(message);
                }
            }
        }
        return messagesToDelete;
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