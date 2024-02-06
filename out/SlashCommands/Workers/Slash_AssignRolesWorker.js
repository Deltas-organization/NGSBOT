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
exports.SlashAssignRolesWorker = void 0;
const DiscordChannels_1 = require("../../enums/DiscordChannels");
const Globals_1 = require("../../Globals");
const DiscordFuzzySearch_1 = require("../../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../../helpers/MessageHelper");
const RoleHelper_1 = require("../../helpers/RoleHelper");
const NGSRoles_1 = require("../../enums/NGSRoles");
const WorkerHelper_1 = require("./Helpers/WorkerHelper");
const AssignRolesOptions_1 = require("../../message-helpers/AssignRolesOptions");
const NGSQueryBuilder_1 = require("../../helpers/NGSQueryBuilder");
class SlashAssignRolesWorker {
    constructor(_dependencies, _interaction) {
        this._dependencies = _dependencies;
        this._interaction = _interaction;
        this._workerhelper = new WorkerHelper_1.WorkerHelper(_dependencies.client, DiscordChannels_1.DiscordChannels.NGSDiscord);
    }
    Run() {
        return __awaiter(this, void 0, void 0, function* () {
            this._roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(yield this._workerhelper.Guild);
            const mutedRole = this._roleHelper.lookForRole(NGSRoles_1.NGSRoles.Muted);
            if (mutedRole)
                this._mutedRole = mutedRole;
            var captainRole = this._roleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
            if (captainRole)
                this._captainRole = captainRole;
            yield this._interaction.editReply({
                content: "Beginning Assignments \n  Loading teams now."
            });
            const teams = yield this._dependencies.dataStore.GetTeams();
            yield this._interaction.editReply({
                content: "Loading Discord Members"
            });
            const guildMembers = yield this._workerhelper.GetGuildMembers();
            if (!guildMembers) {
                yield this._interaction.editReply({
                    content: "Loading members failed."
                });
                return;
            }
            yield this._interaction.editReply({
                content: "Members loaded. \n Assigning Now."
            });
            const messagesLog = [];
            let count = 0;
            let progressCount = 1;
            let steps = 10;
            for (var team of teams.GetTeamsSortedByTeamNames()) {
                count++;
                let messageHelper = yield this.AssignValidRoles(team, guildMembers);
                if (messageHelper) {
                    messagesLog.push(messageHelper);
                }
                if (count > (teams.length / steps) * progressCount) {
                    yield this._interaction.editReply({
                        content: `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`
                    });
                    progressCount++;
                }
            }
        });
    }
    AssignValidRoles(team, guildMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            let messageTracker = new MessageHelper_1.MessageHelper(team.teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageTracker, teamName);
            try {
                let divRoleOnDiscord = null;
                if (team.divisionDisplayName) {
                    const roleResponse = this._roleHelper.FindDivRole(team.divisionDisplayName);
                    divRoleOnDiscord = roleResponse.role;
                }
                yield this.AssignUsersToRoles(team, guildMembers, messageTracker, teamRoleOnDiscord, divRoleOnDiscord);
            }
            catch (e) {
                messageTracker.AddNewLine(`There was a problem assigning team: ${teamName}`);
                Globals_1.Globals.log(e);
                messageTracker.AddJSONLine(e);
            }
            return messageTracker;
        });
    }
    CreateOrFindTeamRole(messageTracker, teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this._roleHelper.lookForRole(teamName);
            if (!teamRoleOnDiscord) {
                teamRoleOnDiscord = yield (yield this._workerhelper.Guild).roles.create({
                    name: teamName,
                    mentionable: true,
                    hoist: true,
                    reason: 'needed a new team role added'
                });
                messageTracker.Options.CreatedTeamRole = true;
            }
            return teamRoleOnDiscord;
        });
    }
    AssignUsersToRoles(team, guildMembers, messageTracker, teamRole, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const teamUsers = yield this._dependencies.dataStore.GetUsersOnTeam(teamName);
            messageTracker.Options = new AssignRolesOptions_1.AssignRolesOptions(teamName);
            messageTracker.AddNewLine("**Team Name**");
            ;
            messageTracker.AddNewLine(teamName);
            messageTracker.AddNewLine("**Users**");
            for (let user of teamUsers) {
                var searchResult = yield DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
                if (searchResult) {
                    const guildMember = searchResult.member;
                    if (searchResult.updateDiscordId)
                        yield this.UpdateDiscordID(user, guildMember);
                    messageTracker.Options.PlayersInDiscord++;
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    if (this._workerhelper.HasRole(rolesOfUser, this._mutedRole)) {
                        messageTracker.AddJSONLine('Didnt add roles as the person is muted');
                        continue;
                    }
                    messageTracker.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                    messageTracker.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                    if (teamRole != null && !this._workerhelper.HasRole(rolesOfUser, teamRole)) {
                        yield this._workerhelper.AssignRole(guildMember, teamRole);
                        messageTracker.Options.AssignedTeamCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${teamRole === null || teamRole === void 0 ? void 0 : teamRole.name}`);
                    }
                    if (divRole != null && !this._workerhelper.HasRole(rolesOfUser, divRole)) {
                        yield this._workerhelper.AssignRole(guildMember, divRole);
                        messageTracker.Options.AssignedDivCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${divRole === null || divRole === void 0 ? void 0 : divRole.name}`);
                    }
                    if (user.IsCaptain || user.IsAssistantCaptain) {
                        if (this._captainRole && !this._workerhelper.HasRole(rolesOfUser, this._captainRole)) {
                            yield this._workerhelper.AssignRole(guildMember, this._captainRole);
                            messageTracker.Options.AssignedCaptainCount++;
                            messageTracker.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                            messageTracker.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                        }
                        if (user.IsCaptain)
                            messageTracker.Options.HasCaptain = true;
                    }
                }
                else {
                    messageTracker.AddNewLine(`**No Matching DiscordId Found**`, 4);
                }
            }
            return messageTracker;
        });
    }
    UpdateDiscordID(user, member) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield new NGSQueryBuilder_1.NGSQueryBuilder().PostResponse('user/save/discordid', {
                    displayName: user.displayName,
                    apiKey: this._dependencies.apiKey,
                    discordId: member.id
                });
                Globals_1.Globals.log(`saved discord id for user: ${user.displayName}`);
            }
            catch (e) {
                Globals_1.Globals.log(e);
                Globals_1.Globals.log(`Unable to save discord id for user: ${user.displayName}`);
            }
        });
    }
}
exports.SlashAssignRolesWorker = SlashAssignRolesWorker;
//# sourceMappingURL=Slash_AssignRolesWorker.js.map