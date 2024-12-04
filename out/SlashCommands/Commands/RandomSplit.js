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
exports.RandomSplitCommand = void 0;
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const MessageContainer_1 = require("../../message-helpers/MessageContainer");
class RandomSplitCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor() {
        super();
        this.Description = "Will Split the Current users Chat Channel into numbered teams.";
        this.Name = "random_teams";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.DeltasServer;
        this.Ephemeral = true;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(interaction.member);
            let members = interaction.member.voice.channel.members;
            for (var member of members) {
                console.log(member[1].nickname);
            }
            const messages = new MessageContainer_1.MessageContainer();
            messages.AddSimpleGroup("hello World");
            yield interaction.followUp({
                ephemeral: this.Ephemeral,
                embeds: messages.AsEmbed
            });
        });
    }
}
exports.RandomSplitCommand = RandomSplitCommand;
//# sourceMappingURL=RandomSplit.js.map