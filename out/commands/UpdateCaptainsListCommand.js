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
const Globals_1 = require("../Globals");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const RoleHelper_1 = require("../helpers/RoleHelper");
class UpdateCaptainsListCommand {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    CreateDivisionList(division, channelToUserForGuildRetrieval) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = yield this.GetGuild(channelToUserForGuildRetrieval);
                const roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(guild);
                const teams = yield this.GetTeamsInDivision(division);
                const divisions = yield this.dataStore.GetDivisions();
                const divisionInformation = divisions.find(d => d.displayName == division);
                if (!divisionInformation)
                    return `Unable to find division: ${division}`;
                const guildMembers = (yield guild.members.fetch()).map((mem, _, __) => mem);
                const modsToLookFor = divisionInformation.moderator.split('&').map(item => item.replace(' ', '').toLowerCase());
                const divMods = guildMembers.filter(member => modsToLookFor.indexOf(DiscordFuzzySearch_1.DiscordFuzzySearch.GetDiscordId(member.user)) != -1);
                const messageHelper = new MessageHelper_1.MessageHelper('captainList');
                messageHelper.AddNewLine(`**${division}** Moderator: ${divMods.join("&")}`);
                for (let team of teams) {
                    const teamRole = roleHelper.lookForRole(team.teamName);
                    messageHelper.AddNewLine((_a = teamRole === null || teamRole === void 0 ? void 0 : teamRole.toString()) !== null && _a !== void 0 ? _a : team.teamName);
                    const users = yield this.dataStore.GetUsersOnTeam(team);
                    let hasAssistant = false;
                    for (let user of users.sort((user1, user2) => this.userSort(user1, user2))) {
                        if (user.IsCaptain) {
                            let guildMember = yield DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                            if (guildMember)
                                messageHelper.AddNew(` - captain ${guildMember.member}`);
                            else
                                messageHelper.AddNew(` - captain ${user.displayName}`);
                        }
                        if (user.IsAssistantCaptain) {
                            let guildMember = yield DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                            if (hasAssistant) {
                                if (guildMember)
                                    messageHelper.AddNew(` and ${guildMember.member}`);
                                else
                                    messageHelper.AddNew(` and ${user.displayName}`);
                            }
                            else {
                                if (guildMember)
                                    messageHelper.AddNew(` / ${guildMember.member}`);
                                else
                                    messageHelper.AddNew(` / ${user.displayName}`);
                                hasAssistant = true;
                            }
                        }
                    }
                }
                messageHelper.AddNewLine(`-----------------------------------`);
                return messageHelper.CreateStringMessage();
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
    GetTeamsInDivision(division) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamHelper = yield this.dataStore.GetTeams();
            return teamHelper.GetTeamsSortedByTeamNames().filter(team => team.divisionDisplayName == division);
        });
    }
    GetGuild(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(channelId));
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