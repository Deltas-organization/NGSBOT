"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandBase = void 0;
class SlashCommandBase {
    constructor() {
        this.type = 1 /* ApplicationCommandTypes.CHAT_INPUT */;
        this.Ephemeral = false;
    }
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name
        };
        return this.command;
    }
}
exports.SlashCommandBase = SlashCommandBase;
//# sourceMappingURL=SlashCommandBase.js.map