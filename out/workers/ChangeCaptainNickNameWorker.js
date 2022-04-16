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
exports.ChangeCaptainNickNameWorker = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const ClientHelper_1 = require("../helpers/ClientHelper");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const WorkerBase_1 = require("./Bases/WorkerBase");
class ChangeCaptainNickNameWorker extends WorkerBase_1.WorkerBase {
    constructor() {
        super(...arguments);
        this._users = [];
        this._usersNamesUnableToUpdate = [];
        this._usersNamesUpdated = [];
        this._usersNotFound = [];
        this._usersAlreadyGoodToGo = [];
        this._usersNamesRemovedTitle = [];
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._guildUsers = yield ClientHelper_1.ClientHelper.GetMembers(this.client, DiscordChannels_1.DiscordChannels.NGSDiscord); // (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            this._users = yield this.dataStore.GetUsers();
            yield this.ReNameCaptains();
            yield this.ReNameAssistantCaptains();
            yield this.RemoveNickNames();
            yield this.SendMessages();
        });
    }
    ReNameCaptains() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var captains = this._users.filter(u => u.IsCaptain);
            for (var captain of captains) {
                var discordUser = (_a = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(captain, this._guildUsers)) === null || _a === void 0 ? void 0 : _a.member;
                if (discordUser) {
                    yield this.AssignNamePrefix(discordUser, "(C)");
                }
                else {
                    this._usersNotFound.push(captain);
                }
            }
        });
    }
    ReNameAssistantCaptains() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var assistantCaptains = this._users.filter(u => u.IsAssistantCaptain);
            for (var assitantCaptain of assistantCaptains) {
                var discordUser = (_a = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(assitantCaptain, this._guildUsers)) === null || _a === void 0 ? void 0 : _a.member;
                if (discordUser) {
                    yield this.AssignNamePrefix(discordUser, "(aC)");
                }
                else {
                    this._usersNotFound.push(assitantCaptain);
                }
            }
        });
    }
    RemoveNickNames() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (var user of this._guildUsers) {
                try {
                    for (var ngsUser of this._users) {
                        var discordUser = (_a = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(ngsUser, this._guildUsers)) === null || _a === void 0 ? void 0 : _a.member;
                        if (!discordUser)
                            continue;
                        if (discordUser.id == user.id) {
                            if (this.CheckForNameValue(user, "(aC)")) {
                                if (!ngsUser.IsAssistantCaptain)
                                    yield this.RemoveFromUser(user, "(aC)");
                            }
                            else if (this.CheckForNameValue(user, "(C)")) {
                                if (!ngsUser.IsCaptain)
                                    yield this.RemoveFromUser(user, "(C)");
                            }
                            break;
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        });
    }
    SendMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            var message = new MessageHelper_1.MessageHelper();
            message.AddNewLine("I was unable to update the following users:");
            message.AddNewLine(this._usersNamesUnableToUpdate.join(", "));
            message.AddEmptyLine();
            message.AddNewLine("I was unable to find the following users:");
            message.AddNewLine(this._usersNotFound.map(u => u.displayName).join(", "));
            message.AddEmptyLine();
            message.AddNewLine("I Added (C) or (AC) to the following users:");
            message.AddNewLine(this._usersNamesUpdated.join(", "));
            message.AddEmptyLine();
            message.AddNewLine("I Removed (C) or (AC) from the following users:");
            message.AddNewLine(this._usersNamesRemovedTitle.join(", "));
            yield this.messageSender.SendBasicMessage(message.CreateStringMessage());
        });
    }
    AssignNamePrefix(discordUser, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.CheckForNameValue(discordUser, prefix) == false) {
                var newName = `${prefix} ${discordUser.displayName}`;
                if (newName.length > 32) {
                    this._usersNamesUnableToUpdate.push(discordUser.displayName);
                }
                else {
                    try {
                        yield discordUser.setNickname(newName, "Changing name to include captain prefix");
                        this._usersNamesUpdated.push(newName);
                    }
                    catch (_a) {
                        this._usersNamesUnableToUpdate.push(discordUser.displayName);
                    }
                }
            }
            else {
                this._usersAlreadyGoodToGo.push(discordUser.displayName);
            }
        });
    }
    CheckForNameValue(user, valueToSearch) {
        var _a, _b;
        var nameWithNoSpaces = (_a = user.nickname) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, '');
        if (nameWithNoSpaces == null)
            nameWithNoSpaces = (_b = user.displayName) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, '');
        valueToSearch = valueToSearch
            .replace("(", "\\(")
            .replace(")", "\\)");
        if (nameWithNoSpaces.search(new RegExp(valueToSearch, "i")) != -1)
            return true;
        return false;
    }
    RemoveFromUser(user, valueToRemove) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            var nameWithNoSpaces = (_a = user.nickname) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, '');
            if (nameWithNoSpaces == null)
                return;
            valueToRemove = valueToRemove
                .replace("(", "\\(")
                .replace(")", "\\)");
            var newName = (_b = user.nickname) === null || _b === void 0 ? void 0 : _b.replace(new RegExp(valueToRemove, "i"), "");
            try {
                yield user.setNickname(newName, "This person is no longer a captain or AC");
                this._usersNamesRemovedTitle.push(user.nickname);
            }
            catch (_c) {
                this._usersNamesUnableToUpdate.push(user.displayName);
            }
        });
    }
}
exports.ChangeCaptainNickNameWorker = ChangeCaptainNickNameWorker;
//# sourceMappingURL=ChangeCaptainNickNameWorker.js.map