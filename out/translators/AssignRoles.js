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
const RoleHelper_1 = require("../helpers/RoleHelper");
const AssignRolesOptions_1 = require("../message-helpers/AssignRolesOptions");
const fs = require('fs');
class AssignRoles extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._testing = false;
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
            yield this.Setup(messageSender);
            yield this.BeginAssigning(messageSender, detailed);
        });
    }
    Setup(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dataStore.Clear();
            yield this.InitializeRoleHelper(messageSender.originalMessage.guild);
            this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
        });
    }
    InitializeRoleHelper(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            this._serverRoleHelper = new RoleHelper_1.RoleHelper(roles);
        });
    }
    BeginAssigning(messageSender, detailed) {
        return __awaiter(this, void 0, void 0, function* () {
            const progressMessage = yield messageSender.SendMessage("Beginning Assignments \n  Loading teams now.");
            const teams = yield this.dataStore.GetTeams();
            yield messageSender.Edit(progressMessage, "Loading Discord Members.");
            const messagesLog = [];
            try {
                const guildMembers = (yield messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
                yield messageSender.Edit(progressMessage, "Members loaded. \n Assigning Now.");
                let count = 0;
                let progressCount = 1;
                let steps = 10;
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    count++;
                    let messageHelper = yield this.AssignValidRoles(messageSender, team, guildMembers);
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
                }
                if (!detailed) {
                    fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
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
            yield messageSender.SendMessage(messageHelper.CreateStringMessage());
            yield progressMessage.delete();
        });
    }
    AssignValidRoles(messageSender, team, guildMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            let result = new MessageHelper_1.MessageHelper(team.teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, result, teamName);
            const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
            const divRoleOnDiscord = roleRsponse.div == NGSRoles_1.NGSRoles.Storm ? null : roleRsponse.role;
            yield this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
            return result;
        });
    }
    CreateOrFindTeamRole(messageSender, messageTracker, teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this._serverRoleHelper.lookForRole(teamName);
            if (!teamRoleOnDiscord) {
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
            if (!this._testing)
                yield guildMember.roles.add(divRole);
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}
exports.AssignRoles = AssignRoles;
//# sourceMappingURL=AssignRoles.js.map