"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandBase = void 0;
const discord_js_1 = require("discord.js");
class SlashCommandBase {
    constructor() {
        this.type = discord_js_1.ApplicationCommandType.ChatInput;
        this.Ephemeral = false;
    }
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name,
            defaultMemberPermissions: this.Permissions
        };
        return this.command;
    }
}
exports.SlashCommandBase = SlashCommandBase;
//# sourceMappingURL=SlashCommandBase.js.map