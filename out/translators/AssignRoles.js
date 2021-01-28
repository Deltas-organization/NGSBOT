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
exports.AssignRoles = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const Globals_1 = require("../Globals");
var fs = require('fs');
class AssignRoles extends adminTranslatorBase_1.AdminTranslatorBase {
    constructor() {
        super(...arguments);
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
            DivisionRole.Storm,
            DivisionRole.Heroic,
            DivisionRole.DivA,
            DivisionRole.DivB,
            DivisionRole.DivC,
            DivisionRole.DivD,
            DivisionRole.DivE,
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
        this._reserveredRoles = [];
    }
    get commandBangs() {
        return ["assign"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this._stopIteration = false;
            const guildMembers = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles(message.originalMessage.guild);
            this.ReloadResservedRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const rolesAdded = [];
            try {
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    yield this.DisplayTeamInformation(message, team, guildMembers, rolesAdded);
                    if (this._stopIteration)
                        break;
                }
            }
            catch (e) {
                console.log(e);
            }
            console.log(rolesAdded);
            //message.SendMessage(`Unable to find roles: ${rolesNotFound.join(', ')}`);
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
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    DisplayTeamInformation(messageSender, team, guildMembers, rolesAdded) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, teamName, rolesAdded);
            const divRoleOnDiscord = null; //this.FindDivRole(team.divisionName);
            let message = "**Team Name** \n";
            message += `${teamName} \n`;
            let userRolesMessage = yield this.AssignUsersToRoles(team, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);
            if (!userRolesMessage)
                return;
            message += userRolesMessage;
            yield messageSender.SendMessage(message);
            return false;
        });
    }
    CreateOrFindTeamRole(messageSender, teamName, rolesAdded) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName);
            if (!teamRoleOnDiscord) {
                rolesAdded.push(teamName);
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
    FindDivRole(divisionDisplayName) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
                divRoleName = divRoleName.DivA;
                break;
            case "b west":
            case "b east":
                divRoleName = divRoleName.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = divRoleName.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = divRoleName.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = divRoleName.DivE;
                break;
            case "storm":
            case "storm":
                divRoleName = divRoleName.Storm;
                break;
            case "heroic":
            case "heroic":
                divRoleName = divRoleName.Heroic;
                break;
        }
        return this.lookForRole(this._serverRoles, divRoleName);
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
    AssignUsersToRoles(team, guildMembers, teamRole, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == team.teamName);
            let message = "**Users** \n";
            let foundOne = false;
            for (let user of teamUsers) {
                const guildMember = this.FindGuildMember(user, guildMembers);
                message += `${user.displayName} \n`;
                if (guildMember) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    message += "\u200B \u200B \u200B \u200B **Current Roles** \n";
                    message += `\u200B \u200B \u200B \u200B ${rolesOfUser.join(',')} \n`;
                    if (!rolesOfUser.find(role => role == teamRole)) {
                        yield guildMember.roles.add(teamRole);
                        foundOne = true;
                        message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${teamRole} \n`;
                    }
                    if (divRole != null && !rolesOfUser.find(role => role == divRole)) {
                        //await guildMember.roles.add(divRole);
                        message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${divRole} \n`;
                    }
                }
                else {
                    message += `\u200B \u200B \u200B \u200B **Not Found** \n`;
                }
            }
            if (!foundOne)
                return null;
            return message;
        });
    }
}
exports.AssignRoles = AssignRoles;
var DivisionRole;
(function (DivisionRole) {
    DivisionRole["DivA"] = "Division A";
    DivisionRole["DivB"] = "Division B";
    DivisionRole["DivC"] = "Division C";
    DivisionRole["DivD"] = "Division D";
    DivisionRole["DivE"] = "Division E";
    DivisionRole["Heroic"] = "Heroic Division";
    DivisionRole["Storm"] = "Storm Division";
})(DivisionRole || (DivisionRole = {}));
//# sourceMappingURL=AssignRoles.js.map