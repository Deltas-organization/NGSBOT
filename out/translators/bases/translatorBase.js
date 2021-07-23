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
exports.TranslatorBase = void 0;
const MessageSender_1 = require("../../helpers/MessageSender");
const DiscordMembers_1 = require("../../enums/DiscordMembers");
const Globals_1 = require("../../Globals");
class TranslatorBase {
    constructor(translatorDependencies) {
        this.translatorDependencies = translatorDependencies;
        this.client = translatorDependencies.client;
        this.messageStore = translatorDependencies.messageStore;
        this.dataStore = translatorDependencies.dataStore;
        this.Init();
    }
    Init() {
    }
    Translate(messageText, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.member.user.id != DiscordMembers_1.DiscordMembers.Delta) {
                //not enough permissions
                if ((yield this.Verify(message)) == false)
                    return;
            }
            let foundBang = false;
            let detailed = false;
            this.commandBangs.forEach(bang => {
                const command = messageText.split(" ")[0];
                const regularCommand = new RegExp(`^${bang}$`, 'i').test(command);
                const detailedCommand = new RegExp(`^${bang}-d$`, 'i').test(command);
                if (regularCommand || detailedCommand) {
                    Globals_1.Globals.log("Running", this.constructor.name);
                    foundBang = true;
                    if (!detailed && detailedCommand) {
                        detailed = true;
                    }
                }
            });
            if (foundBang) {
                let commands = this.RetrieveCommands(messageText);
                let messageSender = new MessageSender_1.MessageSender(this.client, message, this.messageStore);
                this.Interpret(commands, detailed, messageSender);
            }
        });
    }
    RetrieveCommands(command) {
        var firstSpace = command.indexOf(' ');
        if (firstSpace == -1) {
            return [];
        }
        //Get and remove quoted strings as one word
        const myRegexp = /[^\s"]+|"([^"]*)"/gi;
        const myResult = [];
        do {
            var match = myRegexp.exec(command);
            if (match != null) {
                //Index 1 in the array is the captured group if it exists
                //Index 0 is the matched text, which we use if no captured group exists
                myResult.push(match[1] ? match[1] : match[0]);
            }
        } while (match != null);
        return myResult.slice(1);
    }
    Verify(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    SearchForPlayers(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.dataStore.GetUsers();
            const searchRegex = new RegExp(searchTerm, 'i');
            return users.filter(p => searchRegex.test(p.displayName));
        });
    }
}
exports.TranslatorBase = TranslatorBase;
//# sourceMappingURL=translatorBase.js.map