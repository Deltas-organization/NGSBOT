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
const Globals_1 = require("../Globals");
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const MessageHelper_1 = require("../helpers/MessageHelper");
const fs = require('fs');
class AssignRoles extends ngsTranslatorBase_1.ngsTranslatorBase {
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
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this._stopIteration = false;
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            this.ReloadResservedRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const rolesAdded = [];
            const messagesLog = [];
            try {
                const guildMembers = messageSender.originalMessage.guild.members.cache.map((mem, _, __) => mem);
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    let messageHelper = yield this.DisplayTeamInformation(messageSender, team, guildMembers, rolesAdded);
                    if (messageHelper) {
                        if (detailed) {
                            if (!messageHelper.Optional) {
                                yield messageSender.SendMessage(messageHelper.CreateStringMessage());
                            }
                        }
                        else {
                            messagesLog.push(messageHelper);
                        }
                    }
                    if (this._stopIteration)
                        break;
                }
                if (messagesLog.length > 0) {
                    fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({ AddedRoles: rolesAdded, detailedInformation: messagesLog.map(message => message.CreateJsonMessage()) }));
                    messageSender.TextChannel.send({
                        files: [{
                                attachment: './files/assignedRoles.json',
                                name: 'AssignRolesReport.json'
                            }]
                    }).catch(console.error);
                }
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
            yield messageSender.SendMessage(`Finished Assigning Roles!`);
        });
    }
    ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
        }
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    DisplayTeamInformation(messageSender, team, guildMembers, rolesAdded) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, teamName, rolesAdded);
            const divRoleOnDiscord = null; //this.FindDivRole(team.divisionName);
            return yield this.AssignUsersToRoles(team, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);
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
    AssignUsersToRoles(team, guildMembers, ...rolesToLookFor) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == team.teamName);
            let message = new MessageHelper_1.MessageHelper(team.teamName);
            message.AddNewLine("**Team Name**");
            ;
            message.AddNewLine(team.teamName);
            message.AddNewLine("**Users**");
            let foundOne = false;
            for (let user of teamUsers) {
                const guildMember = this.FindGuildMember(user, guildMembers);
                message.AddNewLine(`${user.displayName} : ${user.discordTag}`);
                if (guildMember) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    message.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                    message.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                    for (var roleToLookFor of rolesToLookFor) {
                        if (roleToLookFor != null && !this.HasRole(rolesOfUser, roleToLookFor)) {
                            yield guildMember.roles.add(roleToLookFor);
                            foundOne = true;
                            message.AddNewLine(`**Assigned Role:** ${roleToLookFor}`, 4);
                            message.AddJSONLine(`**Assigned Role:**: ${roleToLookFor.name}`);
                        }
                    }
                }
                else {
                    message.AddNewLine(`**No Matching DiscordId Found**`, 4);
                }
            }
            if (!foundOne) {
                message.Optional = true;
                return message;
            }
            return message;
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
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