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
exports.AssignRolesCommand = void 0;
const discord_js_1 = require("discord.js");
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const Slash_AssignRolesWorker_1 = require("../Workers/Slash_AssignRolesWorker");
class AssignRolesCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor(_dependencies) {
        super();
        this._dependencies = _dependencies;
        this.Description = "Will Assign Roles";
        this.Name = "assign_roles";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.DeltasServer;
        this.Permissions = discord_js_1.PermissionFlagsBits.ManageRoles;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var worker = new Slash_AssignRolesWorker_1.SlashAssignRolesWorker(this._dependencies, interaction);
            yield worker.Run();
            yield interaction.followUp({
                ephemeral: this.Ephemeral,
                content: "Finished Updating the list"
            });
        });
    }
}
exports.AssignRolesCommand = AssignRolesCommand;
//# sourceMappingURL=AssignRolesCommand.js.map