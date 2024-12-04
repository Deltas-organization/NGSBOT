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
exports.RandomTeamCommand = void 0;
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const RandomTeamWorker_1 = require("../Workers/RandomTeamWorker");
class RandomTeamCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor() {
        super();
        this.Description = "Will Split the Current users Chat Channel into numbered teams.";
        this.Name = "random_teams";
        this.GuildLocation = "All";
        this.Ephemeral = true;
        this._membersWithPriority = [];
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let members = interaction.member.voice.channel.members;
            let memberNames = [];
            for (var member of members) {
                if (member[1].nickname != null)
                    memberNames.push(member[1].nickname);
            }
            const worker = new RandomTeamWorker_1.RandomTeamWorker();
            const result = yield worker.Run(memberNames, this._membersWithPriority);
            this._membersWithPriority = result.unselectedPlayerNames;
            yield interaction.followUp({
                ephemeral: this.Ephemeral,
                embeds: result.container.AsEmbed
            });
        });
    }
}
exports.RandomTeamCommand = RandomTeamCommand;
//# sourceMappingURL=RandomTeamCommand.js.map