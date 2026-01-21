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
exports.TrackChannelWorker = void 0;
const NGSMongoHelper_1 = require("../../helpers/NGSMongoHelper");
const ChannelMessageSender_1 = require("../../helpers/messageSenders/ChannelMessageSender");
const DiscordChannels_1 = require("../../enums/DiscordChannels");
class TrackChannelWorker {
    constructor(client, mongoConnectionUri) {
        this.client = client;
        this.mongoConnectionUri = mongoConnectionUri;
        this._mongoHelper = new NGSMongoHelper_1.NGSMongoHelper(this.mongoConnectionUri);
        this._messageSender = new ChannelMessageSender_1.ChannelMessageSender(this.client);
    }
    Run(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._guild = yield this.GetGuild(DiscordChannels_1.DiscordChannels.NGSDiscord);
            return yield this._mongoHelper.AddorStopTrackedChannelsInformation(channelId, 5);
        });
    }
    GetGuild(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(channelId));
            return channel.guild;
        });
    }
}
exports.TrackChannelWorker = TrackChannelWorker;
//# sourceMappingURL=TrackChannelWorker.js.map