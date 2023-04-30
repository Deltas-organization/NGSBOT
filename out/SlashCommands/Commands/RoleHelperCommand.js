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
exports.RoleHelperCommand = void 0;
const discord_js_1 = require("discord.js");
const ButtonSlashCommandBase_1 = require("../Base/ButtonSlashCommandBase");
const NGSMongoHelper_1 = require("../../helpers/NGSMongoHelper");
class RoleHelperCommand extends ButtonSlashCommandBase_1.ButtonSlashCommandBase {
    constructor(dataStore, mongoConnectionUri) {
        super();
        this.dataStore = dataStore;
        this.mongoConnectionUri = mongoConnectionUri;
        this._yesButtonId = "RoleHelperCommand_YesButton";
        this._noButtonId = "RoleHelperCommand_NoButton";
        this.Description = "Will Add Roles.";
        this.Name = "addrole";
        this.GuildLocation = "All";
        this.Ephemeral = false;
    }
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name,
            options: this.CreateOptions()
        };
        return this.command;
    }
    CreateOptions() {
        var options = [];
        options.push({
            name: "name",
            description: "The name of the new role",
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true
        });
        return options;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild) {
                yield interaction.editReply({ content: "Something went wrong, I wasn't able to find the discord server to add the role to." });
                return;
            }
            var newRoleName = interaction.options.data[0].value;
            var role = yield this.CreateRole(newRoleName, interaction.guild);
            var row = new discord_js_1.ActionRowBuilder();
            row.addComponents(yield this.CreateButtons(role.id));
            yield interaction.editReply({ content: 'Make this role unpurgeable', components: [row] });
        });
    }
    CreateButtons(roleId) {
        var buttons = [];
        var yesButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`${this.Name}:${this._yesButtonId}:${roleId}`)
            .setLabel('Yes')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        var noButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`${this.Name}:${this._noButtonId}`)
            .setLabel('No')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        buttons.push(yesButton);
        buttons.push(noButton);
        return buttons;
    }
    RunButton(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const buttonElements = interaction.customId.split(':');
            const clickedButton = buttonElements[1];
            if (clickedButton == this._yesButtonId) {
                if (!interaction.guild)
                    return;
                const roleId = buttonElements[2];
                const mongoHelper = new NGSMongoHelper_1.NGSMongoHelper(this.mongoConnectionUri);
                yield mongoHelper.AddRoleToIgnore(interaction.guild.id, roleId);
                yield interaction.editReply({
                    content: `The role will not be purged.`
                });
            }
        });
    }
    CreateRole(roleName, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield guild.roles.create({
                name: roleName,
                mentionable: true,
                hoist: true,
                reason: 'needed a new team role added'
            });
        });
    }
}
exports.RoleHelperCommand = RoleHelperCommand;
//# sourceMappingURL=RoleHelperCommand.js.map