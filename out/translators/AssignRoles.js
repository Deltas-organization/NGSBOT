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
const NGSRoles_1 = require("../enums/NGSRoles");
const fs = require('fs');
class AssignRoles extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._testing = false;
        this._stopIteration = false;
        this._captainRoleName = 'Captains';
    }
    get commandBangs() {
        return ["assign"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length > 0)
                this._testing = true;
            this._stopIteration = false;
            this.liveDataStore.Clear();
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            const progressMessage = yield messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
            const teams = yield this.liveDataStore.GetTeams();
            yield messageSender.Edit(progressMessage, "Teams Loaded. \n Assigning Now.");
            const rolesAdded = [];
            const messagesLog = [];
            try {
                const guildMembers = (yield messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
                let count = 0;
                let progressCount = 1;
                let steps = 10;
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    count++;
                    let messageHelper = yield this.AssignValidRoles(messageSender, team, guildMembers, rolesAdded);
                    if (messageHelper) {
                        messagesLog.push(messageHelper);
                        if (detailed) {
                            if (!messageHelper.Options.HasValue) {
                                yield messageSender.SendMessage(messageHelper.CreateStringMessage());
                            }
                        }
                    }
                    if (count > (teams.length / steps) * progressCount) {
                        yield messageSender.Edit(progressMessage, `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                        progressCount++;
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
            const teamRolesCreated = messagesLog.filter(m => m.Options.CreatedTeamRole).length;
            if (teamRolesCreated)
                messageHelper.AddNewLine(`Created ${teamRolesCreated} Team Roles`);
            messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} Team Roles`);
            messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedDivCount).reduce((m1, m2) => m1 + m2, 0)} Div Roles`);
            messageHelper.AddNewLine(`Assigned ${messagesLog.map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles `);
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
            yield progressMessage.delete();
        });
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    AssignValidRoles(messageSender, team, guildMembers, rolesAdded) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            let result = new MessageHelper_1.MessageHelper(team.teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, result, teamName, rolesAdded);
            const divRoleOnDiscord = this.FindDivRole(team.divisionDisplayName);
            yield this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
            return result;
        });
    }
    CreateOrFindTeamRole(messageSender, messageTracker, teamName, rolesAdded) {
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
                messageTracker.Options.CreatedTeamRole = true;
            }
            return teamRoleOnDiscord;
        });
    }
    FindDivRole(divisionDisplayName) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
                divRoleName = NGSRoles_1.NGSRoles.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = NGSRoles_1.NGSRoles.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSRoles_1.NGSRoles.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = NGSRoles_1.NGSRoles.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = NGSRoles_1.NGSRoles.DivE;
                break;
            case "nexus":
                divRoleName = NGSRoles_1.NGSRoles.Nexus;
                break;
            case "heroic":
                divRoleName = NGSRoles_1.NGSRoles.Heroic;
                break;
            case "storm":
                return null;
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
    AssignUsersToRoles(team, guildMembers, messageTracker, teamRole, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == team.teamName);
            messageTracker.Options = new MessageOptions(team.teamName);
            messageTracker.AddNewLine("**Team Name**");
            ;
            messageTracker.AddNewLine(team.teamName);
            messageTracker.AddNewLine("**Users**");
            for (let user of teamUsers) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
                if (guildMember) {
                    var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                    messageTracker.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                    messageTracker.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                    if (teamRole != null && !this.HasRole(rolesOfUser, teamRole)) {
                        yield this.AssignRole(guildMember, teamRole);
                        messageTracker.Options.AssignedTeamCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${teamRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${teamRole === null || teamRole === void 0 ? void 0 : teamRole.name}`);
                    }
                    if (divRole != null && !this.HasRole(rolesOfUser, divRole)) {
                        yield this.AssignRole(guildMember, divRole);
                        messageTracker.Options.AssignedDivCount++;
                        messageTracker.AddNewLine(`**Assigned Role:** ${divRole}`, 4);
                        messageTracker.AddJSONLine(`**Assigned Role:**: ${divRole === null || divRole === void 0 ? void 0 : divRole.name}`);
                    }
                    if (user.IsCaptain || user.IsAssistantCaptain) {
                        if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole)) {
                            yield this.AssignRole(guildMember, this._captainRole);
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
    AssignRole(guildMember, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            yield guildMember.roles.add(divRole);
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        if (!this._testing)
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