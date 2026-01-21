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
exports.TrackedChannelCommand = void 0;
const discord_js_1 = require("discord.js");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const RandomOptions_1 = require("../../helpers/RandomOptions");
const TrackChannelWorker_1 = require("../Workers/TrackChannelWorker");
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const DiscordMembers_1 = require("../../enums/DiscordMembers");
class TrackedChannelCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor(mongoConnectionUri) {
        super();
        this.mongoConnectionUri = mongoConnectionUri;
        this.Description = "Will Track this channel";
        this.Name = "track";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.NGS;
        this.Permissions = discord_js_1.PermissionFlagsBits.BanMembers;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = interaction.member;
            console.log(member.id);
            //NGS REC RoleId
            if (member.id != DiscordMembers_1.DiscordMembers.Delta && (member === null || member === void 0 ? void 0 : member.roles.cache.has("522579713554776064")) !== true) {
                yield interaction.followUp({
                    content: 'you do not have permission to run this command'
                });
                return;
            }
            const worker = new TrackChannelWorker_1.TrackChannelWorker(client, this.mongoConnectionUri);
            const message = yield worker.Run(interaction.channelId);
            if (message === "Added") {
                yield interaction.followUp({
                    content: 'This channel is now being tracked.'
                });
            }
            else {
                yield interaction.followUp({
                    content: 'This channel is no longer being tracked.'
                });
            }
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
exports.TrackedChannelCommand = TrackedChannelCommand;
//# sourceMappingURL=TrackChannelCommand.js.map