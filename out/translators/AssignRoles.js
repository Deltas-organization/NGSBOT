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
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const NGSDivisionRoles_1 = require("../enums/NGSDivisionRoles");
const fs = require('fs');
class AssignRoles extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._stopIteration = false;
        this._captainRoleName = 'Captains';
        this._reservedRoleNames = [
            this._captainRoleName,
            'Caster Hopefuls',
            'Free Agents',
            'Moist',
            'Supporter',
            'Interviewee',
            'Bots',
            'Storm Casters',
            NGSDivisionRoles_1.DivisionRole.Storm,
            NGSDivisionRoles_1.DivisionRole.Heroic,
            NGSDivisionRoles_1.DivisionRole.DivA,
            NGSDivisionRoles_1.DivisionRole.DivB,
            NGSDivisionRoles_1.DivisionRole.DivC,
            NGSDivisionRoles_1.DivisionRole.DivD,
            NGSDivisionRoles_1.DivisionRole.DivE,
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
            this.liveDataStore.Clear();
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            this.ReloadResservedRoles();
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            const rolesAdded = [];
            const messagesLog = [];
            try {
                const guildMembers = (yield messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    let messageHelper = yield this.AssignValidRoles(messageSender, team, guildMembers, rolesAdded);
                    if (messageHelper) {
                        messagesLog.push(messageHelper);
                        if (detailed) {
                            if (!messageHelper.Options.HasValue) {
                                yield messageSender.SendMessage(messageHelper.CreateStringMessage());
                            }
                        }
                    }
                    if (this._stopIteration)
                        break;
                }
                if (!detailed) {
                    fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                        AddedRoles: rolesAdded,
                        discordIds: guildMembers.map(guildMember => DiscordFuzzySearch_1.DiscordFuzzySearch.GetDiscordId(guildMember.user) + " : " + guildMember.id),
                        detailedInformation: messagesLog.map(message => message.CreateJsonMessage())
                    }));
                    yield messageSender.TextChannel.send({
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
            const messageHelper = new MessageHelper_1.MessageHelper("Success");
            messageHelper.AddNewLine("Finished Assigning Roles!");
            messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} Team Roles`);
            messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedDivCount).reduce((m1, m2) => m1 + m2, 0)} Div Roles`);
            messageHelper.AddNewLine(`Added ${messagesLog.map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles `);
            const teamsWithNoValidCaptain = [];
            for (var message of messagesLog) {
                if (!message.Options.HasCaptain) {
                    teamsWithNoValidCaptain.push(message.Options.TeamName);
                }
            }
            if (teamsWithNoValidCaptain.length > 0)
                messageHelper.AddNewLine(`Teams with no Assignable Captains: ${teamsWithNoValidCaptain.join(', ')}`);
            else
                messageHelper.AddNewLine(`All teams Have a valid Captain`);
            yield messageSender.SendMessage(messageHelper.CreateStringMessage());
        });
    }
    ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole) {
                this._reserveredRoles.push(foundRole);
                if (foundRole.name == this._captainRoleName)
                    this._captainRole = foundRole;
            }
            else
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
        }
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    AssignValidRoles(messageSender, team, guildMembers, rolesAdded) {
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
                        mentionable: true,
                        hoist: true
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
    AssignUsersToRoles(team, guildMembers, teamRole, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == team.teamName);
            let message = new MessageHelper_1.MessageHelper(team.teamName);
            message.Options = new MessageOptions(team.teamName);
            message.AddNewLine("**Team Name**");
            ;
            message.AddNewLine(team.teamName);
            message.AddNewLine("**Users**");
            for (let user of teamUsers) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                message.AddNewLine(`${user.displayName} : ${user.discordTag}`);
                if (guildMember) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    message.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                    message.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                    if (teamRole != null && !this.HasRole(rolesOfUser, teamRole)) {
                        yield guildMember.roles.add(teamRole);
                        message.Options.AssignedTeamCount++;
                        message.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                        message.AddJSONLine(`**Assigned Role:**: ${teamRole === null || teamRole === void 0 ? void 0 : teamRole.name}`);
                    }
                    if (divRole != null && !this.HasRole(rolesOfUser, divRole)) {
                        yield guildMember.roles.add(divRole);
                        message.Options.AssignedDivCount++;
                        message.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                        message.AddJSONLine(`**Assigned Role:**: ${divRole === null || divRole === void 0 ? void 0 : divRole.name}`);
                    }
                    if (user.IsCaptain || user.IsAssistantCaptain) {
                        if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole)) {
                            yield guildMember.roles.add(this._captainRole);
                            message.Options.AssignedCaptainCount++;
                            message.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                            message.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                        }
                        if (user.IsCaptain)
                            message.Options.HasCaptain = true;
                    }
                }
                else {
                    message.AddNewLine(`**No Matching DiscordId Found**`, 4);
                }
            }
            return message;
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}
exports.AssignRoles = AssignRoles;
class MessageOptions {
    constructor(TeamName) {
        this.TeamName = TeamName;
        this.AssignedTeamCount = 0;
        this.AssignedDivCount = 0;
        this.AssignedCaptainCount = 0;
    }
    get HasValue() {
        if (this.AssignedCaptainCount > 0)
            return true;
        if (this.AssignedDivCount > 0)
            return true;
        if (this.AssignedCaptainCount > 0)
            return true;
        return false;
    }
}
//# sourceMappingURL=AssignRoles.js.map