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
exports.CleanupLFGChannel = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const moment = require("moment-timezone");
const Globals_1 = require("../Globals");
const MessageSender_1 = require("../helpers/messageSenders/MessageSender");
class CleanupLFGChannel {
    constructor(client) {
        this.client = client;
    }
    DeleteOldMessages(pastHourCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.NGSLFG);
            const messagesToDelete = yield this.GetMessagesOlderThen(pastHourCount - 1, guildChannel);
            if (messagesToDelete.length <= 0)
                return;
            Globals_1.Globals.log("deleteing old LFG messages");
            for (var message of messagesToDelete.map(m => m.Message)) {
                try {
                    if (!message.deletable) {
                        Globals_1.Globals.log("unable to delete message.");
                        continue;
                    }
                    yield message.delete();
                }
                catch (e) {
                    MessageSender_1.MessageSender.SendMessageToChannelThroughClient(this.client, "There was a problem deleting a message.", DiscordChannels_1.DiscordChannels.DeltaPmChannel);
                    MessageSender_1.MessageSender.SendMessageToChannelThroughClient(this.client, e, DiscordChannels_1.DiscordChannels.DeltaPmChannel);
                }
            }
        });
    }
    GetMessagesOlderThen(pastHourCount, guildChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchLimit = 100;
            let messages = (yield guildChannel.messages.fetch({ limit: fetchLimit })).map((message, _, __) => message);
            let messagesToDelete = this.GetMessageOlderThen(pastHourCount, messages);
            while (messages.length > 0) {
                messages = (yield guildChannel.messages.fetch({ limit: fetchLimit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
                messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastHourCount, messages));
            }
            return messagesToDelete;
        });
    }
    GetMessageOlderThen(hours, messages) {
        const currentDate = moment();
        let messagesToDelete = [];
        for (var message of messages) {
            let momentDate = moment(message.createdTimestamp);
            const dateDifference = currentDate.diff(momentDate, 'hours');
            if (dateDifference > hours) {
                if (!message.pinned) {
                    messagesToDelete.push(new MessageDeleteContainer(message, dateDifference));
                }
            }
        }
        return messagesToDelete;
    }
    GetChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.client.channels.fetch(channelId));
        });
    }
}
exports.CleanupLFGChannel = CleanupLFGChannel;
class MessageDeleteContainer {
    constructor(Message, DaysOld) {
        this.Message = Message;
        this.DaysOld = DaysOld;
    }
}
//# sourceMappingURL=CleanupLFGChannel.js.map