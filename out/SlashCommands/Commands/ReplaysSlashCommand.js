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
exports.ReplaysSlashCommand = void 0;
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const ButtonSlashCommandBase_1 = require("../Base/ButtonSlashCommandBase");
const ReplayCommandWorker_1 = require("../Workers/ReplayCommandWorker");
class ReplaysSlashCommand extends ButtonSlashCommandBase_1.ButtonSlashCommandBase {
    constructor(dataStore, mongoConnectionUri) {
        super();
        this.dataStore = dataStore;
        this.mongoConnectionUri = mongoConnectionUri;
        this.Description = "Will Download Replay for a team.";
        this.Name = "Replays";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.DeltasServer;
        this.Ephemeral = true;
        this.AllButtonID = "AllReplays";
        this.NewReplayButtonId = "NewReplays";
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var worker = new ReplayCommandWorker_1.ReplayCommandWorker(client, this.dataStore, this.mongoConnectionUri);
            // await interaction.followUp({
            //     content: "Please provide additional information.",
            //     components: [
            //         {
            //             type: ComponentType.Button,
            //         },
            //         {
            //             type: ComponentType.BUTTON,
            //         }
            //     ]
            // })
            var messages = yield worker.Run();
            // await interaction.followUp({
            //     ephemeral: this.Ephemeral,
            //     embeds: messages.AsEmbed          
            // });
        });
    }
    RunButton(client, interaction) {
        throw new Error("Method not implemented.");
    }
    CreateButtons() {
        throw "not implemented";
    }
}
exports.ReplaysSlashCommand = ReplaysSlashCommand;
//# sourceMappingURL=ReplaysSlashCommand.js.map