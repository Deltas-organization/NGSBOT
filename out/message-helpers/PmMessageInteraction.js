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
exports.PmMessageInteraction = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const ChannelMessageSender_1 = require("../helpers/messageSenders/ChannelMessageSender");
class PmMessageInteraction {
    constructor(client, dependencies) {
        this.messageSender = new ChannelMessageSender_1.ChannelMessageSender(client, dependencies.messageStore);
    }
    ReceivePM(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageSender.SendToDiscordChannel(`Message From ${message.author.username}: \n \n ${message.content}`, DiscordChannels_1.DiscordChannels.DeltaPmChannel);
        });
    }
}
exports.PmMessageInteraction = PmMessageInteraction;
//# sourceMappingURL=PmMessageInteraction.js.map