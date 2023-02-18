"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLister = void 0;
const translatorBase_1 = require("./bases/translatorBase");
class CommandLister extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ["commands"];
    }
    get description() {
        return "Lists the available commands";
    }
    constructor(translatorDependencies, translators) {
        super(translatorDependencies);
        this.translators = translators;
    }
    Interpret(commands, detailed, messageSender) {
        let fields = [];
        this.translators.forEach(translator => {
            if (translator.Verify(messageSender.originalMessage))
                fields.push({ name: translator.commandBangs.join(" "), value: translator.description });
        });
        messageSender.SendFields(`Available Commands. \n appending -d will perform the command but return more detail if available \n Ex: >games-d`, fields);
    }
}
exports.CommandLister = CommandLister;
//# sourceMappingURL=commandLister.js.map