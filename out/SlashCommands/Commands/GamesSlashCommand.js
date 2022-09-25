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
exports.GamesSlashCommand = void 0;
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const GamesSlashWorker_1 = require("../Workers/GamesSlashWorker");
class GamesSlashCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor(dataStore) {
        super();
        this.dataStore = dataStore;
        this.Description = "Will Respond to the User with their teams games";
        this.Name = "games";
        this.GuildLocation = "All";
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var worker = new GamesSlashWorker_1.GamesSlashWorker(interaction.user, this.dataStore);
            var messages = yield worker.Run();
            yield interaction.followUp({
                ephemeral: true,
                embeds: messages.AsEmbed
            });
        });
    }
}
exports.GamesSlashCommand = GamesSlashCommand;
//# sourceMappingURL=GamesSlashCommand.js.map