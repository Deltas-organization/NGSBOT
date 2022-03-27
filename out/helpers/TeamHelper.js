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
exports.TeamHelper = void 0;
const Globals_1 = require("../Globals");
const DiscordFuzzySearch_1 = require("./DiscordFuzzySearch");
const RoleHelper_1 = require("./RoleHelper");
const TeamSorter_1 = require("./TeamSorter");
class TeamHelper {
    constructor(dataStore, teams) {
        this.dataStore = dataStore;
        this.teams = teams;
        this.Teams = teams;
        this.length = teams.length;
    }
    FindUserInTeam(guildUser) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var team of this.teams) {
                const teamName = team.teamName;
                const allUsers = yield this.dataStore.GetUsers();
                const teamUsers = allUsers.filter(user => user.teamName == teamName);
                for (var ngsUser of teamUsers) {
                    const foundGuildUser = DiscordFuzzySearch_1.DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser);
                    if (foundGuildUser) {
                        return ngsUser;
                    }
                }
            }
            return null;
        });
    }
    FindUsersOnTeam(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = [];
            for (let team of this.teams) {
                if (teamName == team.teamName) {
                    const users = yield this.dataStore.GetUsersOnTeam(team);
                    for (var user of users) {
                        result.push(user);
                    }
                }
            }
            return result;
        });
    }
    SearchForTeam(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchRegex = new RegExp(searchTerm, 'i');
                return this.Teams.filter(team => searchRegex.test(team.teamName));
            }
            catch (ex) {
                Globals_1.Globals.log(ex);
            }
        });
    }
    LookForTeamByRole(roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var team of this.teams) {
                let teamName = RoleHelper_1.RoleHelper.GroomRoleNameAsLowerCase(team.teamName);
                if (teamName == roleName) {
                    return team;
                }
            }
            return null;
        });
    }
    GetTeamsSortedByDivision() {
        return this.teams.sort((t1, t2) => TeamSorter_1.TeamSorter.SortByTeamDivision(t1, t2));
    }
    GetTeamsSortedByTeamNames() {
        return this.teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName));
    }
}
exports.TeamHelper = TeamHelper;
//# sourceMappingURL=TeamHelper.js.map