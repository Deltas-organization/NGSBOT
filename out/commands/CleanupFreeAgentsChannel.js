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
const DiscordMembers_1 = require("../enums/DiscordMembers");
class CleanupFreeAgentsChannel {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    NotifyUsersOfDelete(pastDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.DeltaServer);
            let messagesToDelete = yield this.GetMessagesOlderThen(pastDayCount, guildChannel);
            for (var message of messagesToDelete) {
                if (message.member.id != DiscordMembers_1.DiscordMembers.Delta)
                    continue;
                yield message.member.send({
                    embed: {
                        color: 0,
                        description: "In 5 days your free agent posting on the website will be deleted, you will need to repost it. Here is the original message: "
                    }
                });
                yield message.member.send({
                    embed: {
                        color: 0,
                        description: message.content
                    }
                });
                break;
            }
        });
    }
    DeleteOldMessages(pastDayCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildChannel = yield this.GetChannel(DiscordChannels_1.DiscordChannels.NGSFreeAgents);
            let messagesToDelete = yield this.GetMessagesOlderThen(pastDayCount, guildChannel);
            console.log(messagesToDelete.length);
            // for(var message of messagesToDelete)
            // {
            //     console.log("deleting");
            //     await message.delete();
            // }
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
                if (messagesToDelete.length >= 100)
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
exports.CleanupFreeAgentsChannel = CleanupFreeAgentsChannel;
//# sourceMappingURL=CleanupFreeAgentsChannel.js.map