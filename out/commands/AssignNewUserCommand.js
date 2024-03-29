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
exports.AssignNewUserCommand = void 0;
const DiscordGuilds_1 = require("../enums/DiscordGuilds");
const NGSRoles_1 = require("../enums/NGSRoles");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const RoleHelper_1 = require("../helpers/RoleHelper");
const MessageContainer_1 = require("../message-helpers/MessageContainer");
class AssignNewUserCommand {
    constructor(dependencies) {
        this.client = dependencies.client;
        this.dataStore = dependencies.dataStore;
    }
    AssignUser(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Setup(guildMember);
            const messageGroup = new MessageContainer_1.MessageGroup();
            if (guildMember.guild.id != DiscordGuilds_1.DiscordGuilds.NGS)
                return;
            messageGroup.AddOnNewLine(`A new userHas joined NGS: **${guildMember.user.username}**`);
            const ngsUser = yield DiscordFuzzySearch_1.DiscordFuzzySearch.GetNGSUser(guildMember.user, yield this.dataStore.GetUsers());
            var foundTeam = false;
            if (ngsUser) {
                const team = yield this.dataStore.LookForRegisteredTeam(ngsUser);
                if (team) {
                    foundTeam = true;
                    messageGroup.AddOnNewLine(`Found new users team: **${team.teamName}**`);
                    const rolesResult = yield this.AssignValidRoles(team, guildMember, ngsUser);
                    if (rolesResult)
                        messageGroup.Combine(rolesResult);
                }
                else {
                    messageGroup.AddOnNewLine(`did not find a team for user.`);
                }
            }
            return { MessageGroup: messageGroup, FoundTeam: foundTeam };
        });
    }
    Setup(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            this._serverRoleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(guildMember.guild);
            var captain = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
            if (captain)
                this._captainRole = captain;
        });
    }
    AssignValidRoles(team, guildMember, ngsUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const teamRoleOnDiscord = yield this.FindTeamRole(teamName);
            let result = new MessageContainer_1.MessageGroup();
            if (!teamRoleOnDiscord) {
                return;
            }
            else {
                result.AddOnNewLine(`Assigned team role`);
                yield guildMember.roles.add(teamRoleOnDiscord);
            }
            const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
            let divRoleOnDiscord = roleRsponse.div == NGSRoles_1.NGSRoles.Storm ? null : roleRsponse.role;
            if (divRoleOnDiscord) {
                result.AddOnNewLine(`Assigned div role`);
                yield guildMember.roles.add(divRoleOnDiscord);
            }
            else {
                result.AddOnNewLine(`Didn't assign div role since season hasn't started`);
            }
            if (ngsUser.IsCaptain || ngsUser.IsAssistantCaptain) {
                if (this._captainRole) {
                    result.AddOnNewLine(`Assigned Captain role`);
                    yield guildMember.roles.add(this._captainRole);
                }
            }
            return result;
        });
    }
    FindTeamRole(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this._serverRoleHelper.lookForRole(teamName);
            if (teamRoleOnDiscord) {
                return teamRoleOnDiscord;
            }
            return null;
        });
    }
}
exports.AssignNewUserCommand = AssignNewUserCommand;
//# sourceMappingURL=AssignNewUserCommand.js.map