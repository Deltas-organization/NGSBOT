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
exports.TrackedChannelWorker = void 0;
const Globals_1 = require("../Globals");
const MessageHelper_1 = require("../helpers/MessageHelper");
const moment = require("moment");
class TrackedChannelWorker {
    constructor(mongoHelper, client) {
        this.mongoHelper = mongoHelper;
        this.client = client;
        this._currentDate = moment();
    }
    SendReminders() {
        return __awaiter(this, void 0, void 0, function* () {
            var result = [];
            try {
                var information = yield this.mongoHelper.GetTrackedChannelsInformation();
                for (var value of information) {
                    console.log("value", value);
                    const guildChannel = yield this.GetChannel(value.channelId);
                    const messages = yield guildChannel.messages.fetch({ limit: 1 });
                    const lastMessage = messages.first();
                    if (lastMessage && this.IsMessageOlderThen(lastMessage, value.reminderDays)) {
                        const messageToSend = new MessageHelper_1.MessageHelper();
                        messageToSend.AddNew(`This channel hasn't been interacted with in a while. Please either stop tracking the channel or continue discussion.`);
                        result.push({ channelId: value.channelId, messagehelper: messageToSend });
                    }
                }
            }
            catch (e) {
                Globals_1.Globals.log("Problem reporting tracked channel.", e);
                Globals_1.Globals.InformDelta("There was a problem with the tracked channel reminder.");
            }
            return result;
        });
    }
    GetChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.client.channels.fetch(channelId));
        });
    }
    IsMessageOlderThen(message, days) {
        let momentDate = moment(message.createdTimestamp);
        const dateDifference = this._currentDate.diff(momentDate, 'days');
        if (dateDifference > days) {
            return true;
        }
        return false;
    }
}
exports.TrackedChannelWorker = TrackedChannelWorker;
//# sourceMappingURL=TrackedChannelWorker.js.map