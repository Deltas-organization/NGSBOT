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
exports.ConfigSetter = void 0;
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
const globals_1 = require("../globals");
class ConfigSetter extends deltaTranslatorBase_1.DeltaTranslatorBase {
    get commandBangs() {
        return ["config", "con"];
    }
    get description() {
        return "Will delete the last message sent by the bot on this server";
    }
    constructor(translatorDependencies) {
        super(translatorDependencies);
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            var informAllState = false;
            for (var command of commands) {
                const lowerCaseCommand = command.toLowerCase();
                switch (lowerCaseCommand) {
                    case 'log':
                        globals_1.Globals.EnableLogging = !globals_1.Globals.EnableLogging;
                        this.InformLogState(messageSender);
                        break;
                    case 'info':
                        informAllState = true;
                        break;
                    case 'advanced':
                        globals_1.Globals.EnableAdvancedLogging = !globals_1.Globals.EnableAdvancedLogging;
                        this.InformAdvancedLogState(messageSender);
                }
            }
            if (informAllState) {
                this.InformLogState(messageSender);
                this.InformAdvancedLogState(messageSender);
            }
        });
    }
    InformLogState(messageSender) {
        messageSender.SendMessage(`Logging is: ${globals_1.Globals.EnableLogging}`);
    }
    InformAdvancedLogState(messageSender) {
        messageSender.SendMessage(`Advanced Logging is: ${globals_1.Globals.EnableAdvancedLogging}`);
    }
}
exports.ConfigSetter = ConfigSetter;
//# sourceMappingURL=ConfigSetter.js.map