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
exports.AssignRolesWorker = void 0;
const NGSRoles_1 = require("../enums/NGSRoles");
const Globals_1 = require("../Globals");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const AssignRolesOptions_1 = require("../message-helpers/AssignRolesOptions");
const RoleWorkerBase_1 = require("./Bases/RoleWorkerBase");
const fs = require('fs');
class AssignRolesWorker extends RoleWorkerBase_1.RoleWorkerBase {
    constructor() {
        super(...arguments);
        this._testing = false;
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length > 0)
                this._testing = true;
            yield this.BeginAssigning();
        });
    }
    BeginAssigning() {
        return __awaiter(this, void 0, void 0, function* () {
            const progressMessage = yield this.messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
            const teams = yield this.dataStore.GetTeams();
            yield this.messageSender.Edit(progressMessage, "Loading Discord Members.");
            const messagesLog = [];
            try {
                const guildMembers = (yield this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
                yield this.messageSender.Edit(progressMessage, "Members loaded. \n Assigning Now.");
                let count = 0;
                let progressCount = 1;
                let steps = 10;
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    count++;
                    let messageHelper = yield this.AssignValidRoles(team, guildMembers);
                    if (messageHelper) {
                        messagesLog.push(messageHelper);
                    }
                    if (count > (teams.length / steps) * progressCount) {
                        yield this.messageSender.Edit(progressMessage, `Assignment Continuing \n Progress: ${progressCount * (100 / steps)}%`);
                        progressCount++;
                    }
                }
                fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                    detailedInformation: messagesLog.map(message => message.CreateJsonMessage())
                }));
                yield this.messageSender.TextChannel.send({
                    files: [{
                            attachment: './files/assignedRoles.json',
                            name: 'AssignRolesReport.json'
                        }]
                }).catch(console.error);
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
            const teamsWithLessThen3People = [];
            for (var message of messagesLog) {
                if (!message.Options.HasCaptain) {
                    teamsWithNoValidCaptain.push(message.Options.TeamName);
                }
                if (message.Options.PlayersInDiscord < 3) {
                    teamsWithLessThen3People.push(message.Options.TeamName);
                }
            }
            if (teamsWithNoValidCaptain.length > 0)
                messageHelper.AddNewLine(`**Teams with no Assignable Captains**: ${teamsWithNoValidCaptain.join(', ')}`);
            else
                messageHelper.AddNewLine(`All teams Have a valid Captain! woot.`);
            if (teamsWithLessThen3People.length > 0)
                messageHelper.AddNewLine(`**Teams without 3 people registered**: ${teamsWithLessThen3People.join(', ')}`);
            else
                messageHelper.AddNewLine(`All teams Have 3 people registed on the website and present in the discord!!!`);
            yield this.messageSender.SendMessage(messageHelper.CreateStringMessage());
            yield progressMessage.delete();
        });
    }
    AssignValidRoles(team, guildMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            let result = new MessageHelper_1.MessageHelper(team.teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(result, teamName);
            try {
                if (team.divisionDisplayName) {
                    const roleResponse = this.roleHelper.FindDivRole(team.divisionDisplayName);
                    var divRoleOnDiscord = roleResponse.div == NGSRoles_1.NGSRoles.Storm ? null : roleResponse.role;
                }
                yield this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
            }
            catch (e) {
                result.AddNewLine(`There was a problem assigning team: ${teamName}`);
                result.AddJSONLine(e);
            }
            return result;
        });
    }
    CreateOrFindTeamRole(messageTracker, teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this.roleHelper.lookForRole(teamName);
            if (!teamRoleOnDiscord) {
                teamRoleOnDiscord = yield this.messageSender.originalMessage.guild.roles.create({
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
    AssignUsersToRoles(team, guildMembers, messageTracker, teamRole, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const teamUsers = yield this.dataStore.GetUsersOnTeam(teamName);
            messageTracker.Options = new AssignRolesOptions_1.AssignRolesOptions(teamName);
            messageTracker.AddNewLine("**Team Name**");
            ;
            messageTracker.AddNewLine(teamName);
            messageTracker.AddNewLine("**Users**");
            for (let user of teamUsers) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                messageTracker.AddNewLine(`${user.displayName} : ${user.discordTag}`);
                if (guildMember) {
                    messageTracker.Options.PlayersInDiscord++;
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
                        if (this.captainRole && !this.HasRole(rolesOfUser, this.captainRole)) {
                            yield this.AssignRole(guildMember, this.captainRole);
                            messageTracker.Options.AssignedCaptainCount++;
                            messageTracker.AddNewLine(`**Assigned Role:** ${this.captainRole}`, 4);
                            messageTracker.AddJSONLine(`**Assigned Role:**: ${this.captainRole.name}`);
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
    AssignRole(guildMember, roleToAssign) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._testing)
                yield guildMember.roles.add(roleToAssign);
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}
exports.AssignRolesWorker = AssignRolesWorker;
//# sourceMappingURL=AssignRolesWorker.js.map