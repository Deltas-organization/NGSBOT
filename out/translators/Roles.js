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
exports.Roles = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
const Globals_1 = require("../Globals");
var fs = require('fs');
class Roles extends adminTranslatorBase_1.AdminTranslatorBase {
    constructor(translatorDependencies, liveDataStore) {
        super(translatorDependencies);
        this.liveDataStore = liveDataStore;
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
        this._reserveredRoles = [];
    }
    get commandBangs() {
        return ["roles"];
    }
    get description() {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this._stopIteration = false;
            const guildMembers = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles(message.originalMessage.guild);
            this.ReloadResservedRoles(message.originalMessage.guild);
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
    ReloadResservedRoles(guild) {
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
    DisplayTeamInformation(messageSender, team, guildMembers, rolesNotFound) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            const allUsers = yield this.liveDataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            let roleOnServer = this.lookForRole(this._serverRoles, teamName);
            if (!roleOnServer) {
                rolesNotFound.push(teamName);
                return;
                roleOnServer = yield messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: teamName,
                    },
                    reason: 'needed a new team role added'
                });
            }
            let message = "**Team Name** \n";
            message += `${teamName} \n`;
            message += yield this.GetMembersMessage(teamUsers, guildMembers, roleOnServer);
            yield messageSender.SendMessage(message);
            return false;
        });
    }
    lookForRole(userRoles, roleName) {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }
        roleNameTrimmed = roleNameTrimmed.toLowerCase();
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
    AskIfYouWantToAddRoleToServer(messageSender, teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            let role;
            let reactionResponse = yield messageSender.SendReactionMessage(`It looks like the team: ${teamName} has registered, but there is not currently a role for that team. Would you like me to create this role?`, (member) => this.IsAuthenticated(member), () => __awaiter(this, void 0, void 0, function* () {
                role = yield messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: teamName,
                    },
                    reason: 'needed a new team role added'
                });
            }));
            reactionResponse.message.delete();
            if (reactionResponse.response == null)
                this._stopIteration = true;
            return role;
        });
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
    GetMembersMessage(teamUsers, guildMembers, teamRole) {
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
                    for (var role of rolesOfUser) {
                        if (role == teamRole)
                            continue;
                        if (!this._reserveredRoles.find(serverRole => serverRole.name == role.name)) {
                            if (this._myRole.comparePositionTo(role) > 0)
                                try {
                                    //await guildMember.roles.remove(role);
                                    message += `\u200B \u200B \u200B \u200B **Removed Role:** ${role} \n`;
                                }
                                catch (e) {
                                }
                        }
                    }
                }
                else {
                    message += `\u200B \u200B \u200B \u200B **Not Found** \n`;
                }
            }
            return message;
        });
    }
    CheckUsers(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            var myChannel = this.translatorDependencies.client.channels.cache.find(channel => channel.id == channelID);
            this._stopIteration = false;
            const ngsUsers = yield this.liveDataStore.GetUsers();
            const guildMembers = myChannel.guild.members.cache.map((mem, _, __) => mem);
            this.ReloadServerRoles(myChannel.guild);
            let message = "";
            for (var ngsUser of ngsUsers) {
                const guildMember = this.FindGuildMember(ngsUser, guildMembers);
                if (guildMember) {
                    const teamName = ngsUser.teamName;
                    let roleOnServer = this.lookForRole(this._serverRoles, teamName);
                    if (!roleOnServer) {
                        message += `Added role for team: ${teamName} \n`;
                        // roleOnServer = await myChannel.guild.roles.create({
                        //     data: {
                        //         name: teamName,
                        //     },
                        //     reason: 'needed a new team role added'
                        // });
                        this._serverRoles.push(roleOnServer);
                    }
                    message += `Assigned: ${ngsUser.displayName} to role: ${teamName}. \n`;
                    // guildMember.roles.add(roleOnServer);
                }
            }
            yield myChannel.send({
                embed: {
                    color: 0,
                    description: message
                }
            });
        });
    }
}
exports.Roles = Roles;
//# sourceMappingURL=Roles.js.map