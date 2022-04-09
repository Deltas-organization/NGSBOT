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
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._guildUsers = (yield this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            this._users = yield this.dataStore.GetUsers();
            yield this.ReNameCaptains();
            yield this.ReNameAssistantCaptains();
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
                    if (this.CheckForNameValue(discordUser, "(C)") == false) {
                        var newName = `(C) ${discordUser.displayName}`;
                        if (newName.length > 32) {
                            this._usersNamesUnableToUpdate.push(discordUser.displayName);
                        }
                        else {
                            try {
                                yield discordUser.setNickname(newName, "Changing name to include captain prefix");
                                this._usersNamesUpdated.push(newName);
                            }
                            catch (_b) {
                                this._usersNamesUnableToUpdate.push(discordUser.displayName);
                            }
                        }
                    }
                    else {
                        this._usersAlreadyGoodToGo.push(discordUser.displayName);
                    }
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
            var assitantCaptains = this._users.filter(u => u.IsAssistantCaptain);
            for (var assitantCaptain of assitantCaptains) {
                var discordUser = (_a = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(assitantCaptain, this._guildUsers)) === null || _a === void 0 ? void 0 : _a.member;
                if (discordUser) {
                    if (this.CheckForNameValue(discordUser, "(aC)") == false) {
                        var newName = `(aC) ${discordUser.displayName}`;
                        if (newName.length > 32) {
                            this._usersNamesUnableToUpdate.push(discordUser.displayName);
                        }
                        else {
                            try {
                                yield discordUser.setNickname(newName, "Changing name to include assitant captain prefix");
                                this._usersNamesUpdated.push(newName);
                            }
                            catch (_b) {
                                this._usersNamesUnableToUpdate.push(discordUser.displayName);
                            }
                        }
                    }
                    else {
                        this._usersAlreadyGoodToGo.push(discordUser.displayName);
                    }
                }
                else {
                    this._usersNotFound.push(assitantCaptain);
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
            message.AddNewLine("I update the following users:");
            message.AddNewLine(this._usersNamesUpdated.join(", "));
            yield this.messageSender.SendBasicMessage(message.CreateStringMessage());
        });
    }
    CheckForNameValue(user, valueToSearch) {
        var _a, _b;
        var nameWithNoSpaces = (_a = user.nickname) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, '');
        if (nameWithNoSpaces == null)
            nameWithNoSpaces = (_b = user.displayName) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, '');
        if (nameWithNoSpaces.search(new RegExp(valueToSearch, "i")) != -1)
            return true;
        return false;
    }
}
exports.ChangeCaptainNickNameWorker = ChangeCaptainNickNameWorker;
//# sourceMappingURL=ChangeCaptainNickNameWorker.js.map