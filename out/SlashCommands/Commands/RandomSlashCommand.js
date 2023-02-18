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
exports.RandomSlashCommand = void 0;
const discord_js_1 = require("discord.js");
const RandomOptions_1 = require("../../helpers/RandomOptions");
const OptionsCommandBase_1 = require("../Base/OptionsCommandBase");
const RandomSlashworker_1 = require("../Workers/RandomSlashworker");
class RandomSlashCommand extends OptionsCommandBase_1.OptionsCommandBase {
    constructor() {
        super(...arguments);
        this.Description = "Return a Random Item from the list";
        this.Name = "random_hots";
        this.GuildLocation = "All";
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new RandomSlashworker_1.RandomSlashWorker();
            const message = worker.Run(interaction.options.data);
            yield interaction.followUp({
                content: message.SingleMessage
            });
        });
    }
    CreateOptions() {
        const options = [];
        for (var option of RandomOptions_1.Random.options) {
            options.push({
                name: option.name,
                description: option.description,
                type: discord_js_1.ApplicationCommandOptionType.Integer
            });
        }
        return options;
    }
}
exports.RandomSlashCommand = RandomSlashCommand;
//# sourceMappingURL=RandomSlashCommand.js.map