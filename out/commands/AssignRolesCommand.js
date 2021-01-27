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
exports.AssignRolesCommand = void 0;
const Globals_1 = require("../Globals");
class AssignRolesCommand {
    constructor(message) {
        this.message = message;
        this._stopIteration = false;
        this._reservedRoleNames = [
            'Captains',
            'Caster Hopefuls',
            'Free Agents',
            'Moist',
            'Supporter',
            'Interviewee',
            'Bots',
            'Storm Casters',
            'Storm Division',
            'Heroic Division',
            'Division A',
            'Division B',
            'Division C',
            'Division D',
            'Division E',
            'Ladies of the Nexus',
            'HL Staff',
            'Editor',
            'Nitro Booster',
            'It',
            'Has Cooties',
            'PoGo Raider',
            'FA Combine',
            '@everyone'
        ];
        this.reserveredRoles = [];
        this.guild = message.originalMessage.guild;
    }
    get commandBangs() {
        return ["assign"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Create() {
        return __awaiter(this, void 0, void 0, function* () {
            this._stopIteration = false;
            const guildMembers = this.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles();
            this.ReloadResservedRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const rolesNotFound = [];
            for (var team of teams) {
                yield this.DisplayTeamInformation(message, team, guildMembers, rolesNotFound);
                if (this._stopIteration)
                    break;
            }
            message.SendMessage(`Unable to find roles: ${rolesNotFound.join(', ')}`);
            console.log("Done");
        });
    }
    ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                console.log(`didnt find role: ${roleName}`);
        }
    }
    ReloadServerRoles() {
        this._serverRoles = this.guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    DisplayTeamInformation(messageSender, team, guildMembers, rolesNotFound) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, teamName, rolesNotFound);
            const divRole = yield this.FindDivRole(team.divisionDisplayName);
            let message = "**Team Name** \n";
            message += `${teamName} \n`;
            message += yield this.AssignUsersToRoles(teamUsers, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);
            yield messageSender.SendMessage(message);
            return false;
        });
    }
    CreateOrFindTeamRole(messageSender, teamName, rolesNotFound) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName);
            if (!teamRoleOnDiscord) {
                rolesNotFound.push(teamName);
                return;
                teamRoleOnDiscord = yield messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: teamName,
                    },
                    reason: 'needed a new team role added'
                });
            }
            return teamRoleOnDiscord;
        });
    }
    lookForRole(userRoles, roleName) {
        let roleNameTrimmed = roleName.trim().toLowerCase();
        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;
            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');
            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }
    FindGuildMember(user, guildMembers) {
        var _a;
        const ngsDiscordId = (_a = user.discordTag) === null || _a === void 0 ? void 0 : _a.replace(' ', '').toLowerCase();
        for (let member of guildMembers) {
            const guildUser = member.user;
            const discordName = `${guildUser.username}#${guildUser.discriminator}`.toLowerCase();
            if (discordName == ngsDiscordId) {
                return member;
            }
        }
        return null;
    }
    AssignUsersToRoles(teamUsers, guildMembers, teamRole) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = "**Users** \n";
            for (let user of teamUsers) {
                const guildMember = this.FindGuildMember(user, guildMembers);
                message += `${user.displayName} \n`;
                if (guildMember) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    message += "\u200B \u200B \u200B \u200B **Current Roles** \n";
                    message += `\u200B \u200B \u200B \u200B ${rolesOfUser.join(',')} \n`;
                    if (!rolesOfUser.find(role => role == teamRole)) {
                        //await guildMember.roles.add(teamRole);
                        message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${teamRole} \n`;
                    }
                }
                else {
                    message += `\u200B \u200B \u200B \u200B **Not Found** \n`;
                }
            }
            return message;
        });
    }
}
exports.AssignRolesCommand = AssignRolesCommand;
//# sourceMappingURL=AssignRolesCommand.js.map