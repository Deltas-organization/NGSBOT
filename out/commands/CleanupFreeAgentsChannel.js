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
exports.CleanupFreeAgentsChannel = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const moment = require("moment-timezone");
const Globals_1 = require("../Globals");
const MessageSender_1 = require("../helpers/messageSenders/MessageSender");
class CleanupFreeAgentsChannel {
    constructor(client) {
        this.client = client;
    }
    NotifyUsersOfDelete(exactDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.NGSFreeAgents);
            const messagesToDelete = yield this.GetMessagesOlderThen(exactDayCount - 1, guildChannel);
            if (messagesToDelete.length <= 0)
                return;
            Globals_1.Globals.log("notifying users of messages about to be deleted");
            for (let container of messagesToDelete) {
                const message = container.Message;
                try {
                    if (container.DaysOld != exactDayCount)
                        continue;
                    if (!message.author) {
                        continue;
                    }
                    if (!message.deletable)
                        continue;
                    yield message.author.send("In 5 days your free agent posting on the NGS Discord Server will be deleted, you will need to repost it if you are still looking for a team. \n If you have any questions or concerns please bring them up in the discord you can mention DeltaSniper in the comment.");
                }
                catch (e) {
                    Globals_1.Globals.log("there was a problem notifying user about a message being deleted soon. User: " + message.author.username, e);
                }
            }
        });
    }
    DeleteOldMessages(pastDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.NGSFreeAgents);
            const messagesToDelete = yield this.GetMessagesOlderThen(pastDayCount - 1, guildChannel);
            if (messagesToDelete.length <= 0)
                return;
            Globals_1.Globals.log("deleteing old free agent messages");
            for (var message of messagesToDelete.map(m => m.Message)) {
                try {
                    if (!message.deletable) {
                        Globals_1.Globals.log("unable to delete message.");
                        continue;
                    }
                    try {
                        yield message.author.send("Your free agent posting is being deleted for being older then 65 days. Here is the original message. \n \n If you have any questions or concerns please bring them up in the discord you can mention DeltaSniper in the comment.");
                        yield message.author.send({
                            embeds: [{
                                    color: 0,
                                    description: message.content
                                }]
                        });
                    }
                    catch (e) {
                        MessageSender_1.MessageSender.SendMessageToChannelThroughClient(this.client, "Unable to inform a user of their deleted post.", DiscordChannels_1.DiscordChannels.DeltaPmChannel);
                        MessageSender_1.MessageSender.SendMessageToChannelThroughClient(this.client, e, DiscordChannels_1.DiscordChannels.DeltaPmChannel);
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
    GetMessagesOlderThen(pastDayCount, guildChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchLimit = 100;
            let messages = (yield guildChannel.messages.fetch({ limit: fetchLimit })).map((message, _, __) => message);
            let messagesToDelete = this.GetMessageOlderThen(pastDayCount, messages);
            while (messages.length > 0) {
                messages = (yield guildChannel.messages.fetch({ limit: fetchLimit, before: messages[messages.length - 1].id })).map((message, _, __) => message);
                messagesToDelete = messagesToDelete.concat(this.GetMessageOlderThen(pastDayCount, messages));
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
exports.CleanupFreeAgentsChannel = CleanupFreeAgentsChannel;
class MessageDeleteContainer {
    constructor(Message, DaysOld) {
        this.Message = Message;
        this.DaysOld = DaysOld;
    }
}
//# sourceMappingURL=CleanupFreeAgentsChannel.js.map