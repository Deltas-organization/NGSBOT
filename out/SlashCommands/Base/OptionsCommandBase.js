"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsCommandBase = void 0;
const SlashCommandBase_1 = require("./SlashCommandBase");
class OptionsCommandBase extends SlashCommandBase_1.SlashCommandBase {
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name,
            options: this.CreateOptions(),
            defaultMemberPermissions: this.Permissions
        };
        return this.command;
    }
}
exports.OptionsCommandBase = OptionsCommandBase;
//# sourceMappingURL=OptionsCommandBase.js.map