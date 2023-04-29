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
exports.HelloWorldCommand = void 0;
const discord_js_1 = require("discord.js");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const ButtonSlashCommandBase_1 = require("../Base/ButtonSlashCommandBase");
class HelloWorldCommand extends ButtonSlashCommandBase_1.ButtonSlashCommandBase {
    constructor() {
        super(...arguments);
        this._yesButtonId = "YesButton";
        this._noButtonId = "NoButton";
        this.Description = "Will Tell the User Hello";
        this.Name = "helloworldtest";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.DeltasServer;
        this.Ephemeral = true;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.editReply({
                content: "Hello World!!!"
            });
            var row = new discord_js_1.ActionRowBuilder();
            row.addComponents(yield this.CreateButtons());
            var worker = new HelloWorldCommand(); //client, this.dataStore, this.mongoConnectionUri);
            yield interaction.editReply({ content: 'Make this role unpurgeable', components: [row] });
        });
    }
    CreateButtons() {
        var buttons = [];
        var yesButton = new discord_js_1.ButtonBuilder()
            .setCustomId(this._yesButtonId)
            .setLabel('Yes')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        var noButton = new discord_js_1.ButtonBuilder()
            .setCustomId(this._noButtonId)
            .setLabel('No')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        buttons.push(yesButton);
        buttons.push(noButton);
        return buttons;
    }
    RunButton(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var buttonName = "No";
            if (interaction.customId == this._yesButtonId)
                buttonName = "Yes";
            yield interaction.editReply({
                content: `You pressed the ${buttonName} button.`
            });
        });
    }
}
exports.HelloWorldCommand = HelloWorldCommand;
//# sourceMappingURL=HelloWorldCommand.js.map