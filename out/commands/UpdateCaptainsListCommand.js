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
exports.UpdateCaptainsListCommand = void 0;
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const RoleHelper_1 = require("../helpers/RoleHelper");
const TeamSorter_1 = require("../helpers/TeamSorter");
class UpdateCaptainsListCommand {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    UpdateDivisionList(division, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = yield this.GetGuild(channelId);
            const roleHelper = yield this.CreateRoleHelper(guild);
            const teams = yield this.GetTeamsInDivision(division);
            const divisionInformaiton = yield (yield this.dataStore.GetDivisions()).find(d => d.displayName == division);
            const guildMembers = (yield guild.members.fetch()).map((mem, _, __) => mem);
            const divMod = guildMembers.find(member => DiscordFuzzySearch_1.DiscordFuzzySearch.GetDiscordId(member.user) == divisionInformaiton.moderator.toLowerCase());
            const messageHelper = new MessageHelper_1.MessageHelper('captainList');
            messageHelper.AddNewLine(`**${division}** Moderator: ${divMod}`);
            for (let team of teams) {
                const teamRole = roleHelper.lookForRole(team.teamName);
                messageHelper.AddNewLine(teamRole.toString());
                const users = yield this.dataStore.GetUsersOnTeam(team);
                let hasAssistant = false;
                for (let user of users.sort((user1, user2) => this.userSort(user1, user2))) {
                    if (user.IsCaptain) {
                        let guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        messageHelper.AddNew(` - captain ${guildMember !== null && guildMember !== void 0 ? guildMember : user.displayName}`);
                    }
                    if (user.IsAssistantCaptain) {
                        let guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        if (hasAssistant) {
                            messageHelper.AddNew(` and ${guildMember !== null && guildMember !== void 0 ? guildMember : user.displayName}`);
                        }
                        else {
                            messageHelper.AddNew(` / ${guildMember !== null && guildMember !== void 0 ? guildMember : user.displayName}`);
                            hasAssistant = true;
                        }
                    }
                }
            }
            return messageHelper.CreateStringMessage();
        });
    }
    GetTeamsInDivision(division) {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.dataStore.GetTeams();
            const divisionTeams = teams.filter(team => team.divisionDisplayName == division).sort((t1, t2) => TeamSorter_1.TeamSorter.SortByTeamName(t1, t2));
            return divisionTeams;
        });
    }
    CreateRoleHelper(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            const roleHelper = new RoleHelper_1.RoleHelper(roles);
            return roleHelper;
        });
    }
    GetGuild(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(channelId, false));
            return channel.guild;
        });
    }
    userSort(user1, user2) {
        if (user1.IsCaptain)
            return -1;
        if (user2.IsCaptain)
            return 1;
        return 0;
    }
}
exports.UpdateCaptainsListCommand = UpdateCaptainsListCommand;
//# sourceMappingURL=UpdateCaptainsListCommand.js.map