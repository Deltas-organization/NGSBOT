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
exports.UpdateCaptainsList = void 0;
const Globals_1 = require("../Globals");
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const UpdateCaptainsListCommand_1 = require("../commands/UpdateCaptainsListCommand");
const NGSDivisions_1 = require("../enums/NGSDivisions");
const DiscordChannels_1 = require("../enums/DiscordChannels");
const SendChannelMessage_1 = require("../helpers/SendChannelMessage");
const fs = require('fs');
class UpdateCaptainsList extends ngsTranslatorBase_1.ngsTranslatorBase {
    get commandBangs() {
        return ["captain", "captains"];
    }
    get description() {
        return "Will update the captain list";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateCaptainsList = new UpdateCaptainsListCommand_1.UpdateCaptainsListCommand(this.translatorDependencies);
            const channelSender = new SendChannelMessage_1.SendChannelMessage(this.client, this.messageStore);
            const message = yield messageSender.SendMessage("Updating captains list now");
            for (var value in NGSDivisions_1.NGSDivisions) {
                const division = NGSDivisions_1.NGSDivisions[value];
                try {
                    yield this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, 13, division);
                }
                catch (_a) {
                    yield this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, 13, division);
                }
            }
            message.Edit("Captains list has been updated");
        });
    }
    AttemptToUpdateCaptainMessage(captainsListCommand, channelSender, season, division) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageId = yield this.GetSavedMessage(season, division);
            const message = yield captainsListCommand.CreateDivisionList(division, DiscordChannels_1.DiscordChannels.NGSDiscord);
            if (messageId)
                yield channelSender.OverwriteMessage(message, messageId, DiscordChannels_1.DiscordChannels.NGSCaptainList, true);
            else {
                var messages = yield channelSender.SendMessageToChannel(message, DiscordChannels_1.DiscordChannels.NGSCaptainList, true);
                yield this.CreateMongoRecord(messages, season, division);
            }
        });
    }
    GetSavedMessage(season, division) {
        return __awaiter(this, void 0, void 0, function* () {
            var mongoHelper = this.CreateMongoHelper();
            return mongoHelper.GetCaptainListMessageId(season, division);
        });
    }
    CreateMongoRecord(messages, season, division) {
        return __awaiter(this, void 0, void 0, function* () {
            if (messages.length > 1) {
                Globals_1.Globals.log("There is more then one captain message for a division help...");
                return;
            }
            var mongoHelper = this.CreateMongoHelper();
            return yield mongoHelper.CreateCaptainListRecord(messages[0].id, season, division);
        });
    }
}
exports.UpdateCaptainsList = UpdateCaptainsList;
//# sourceMappingURL=UpdateCaptainsList.js.map