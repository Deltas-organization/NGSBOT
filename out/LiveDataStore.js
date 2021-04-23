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
exports.LiveDataStore = void 0;
const Globals_1 = require("./Globals");
const Cacher_1 = require("./helpers/Cacher");
const NGSQueryBuilder_1 = require("./helpers/NGSQueryBuilder");
const AugmentedNGSUser_1 = require("./models/AugmentedNGSUser");
class LiveDataStore {
    constructor() {
        this.cachedDivisions = new Cacher_1.Cacher(60 * 24);
        this.cachedSchedule = new Cacher_1.Cacher(60);
        this.cachedUsers = new Cacher_1.Cacher(60 * 24);
        this.cachedTeams = new Cacher_1.Cacher(60 * 24);
        this.cachedRegisteredTeams = new Cacher_1.Cacher(60 * 24);
    }
    Clear() {
        this.cachedDivisions.Clear();
        this.cachedSchedule.Clear();
        this.cachedUsers.Clear();
        this.cachedTeams.Clear();
        this.cachedRegisteredTeams.Clear();
    }
    GetDivisions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedDivisions.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse('/division/get/all'));
        });
    }
    GetSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedSchedule.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse('/schedule/get/matches/scheduled?season=11'));
        });
    }
    GetUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
        });
    }
    GetTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedTeams.TryGetFromCache(() => this.GetFreshTeams());
        });
    }
    // public async GetMatches(round: number): Promise<INGSSchedule[]> {
    //     return new NGSQueryBuilder().PostResponse<INGSSchedule[]>('/schedule/fetch/matches', {season: 11, round: round});
    // }
    GetRegisteredTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedRegisteredTeams.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse('/team/get/registered'));
        });
    }
    GetFreshUsers() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let allUsers = [];
            const teams = yield this.GetTeams();
            for (let team of teams) {
                try {
                    const encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                    const ngsMembers = yield new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse(`/user/get?users=${encodedUsers.join()}`);
                    const teamMembers = this.AugmentNgsUsers(ngsMembers, team);
                    allUsers = allUsers.concat(teamMembers);
                }
                catch (e) {
                    Globals_1.Globals.log(`Problem Retrieving division ${team.divisionDisplayName} team: ${team.teamName}  users: ${(_a = team.teamMembers) === null || _a === void 0 ? void 0 : _a.map(member => member.displayName)}}`);
                }
            }
            return allUsers;
        });
    }
    AugmentNgsUsers(ngsMembers, team) {
        const captainName = team.captain.toLowerCase();
        const assistantCaptains = team.assistantCaptain.map(ac => ac.toLowerCase());
        const teamMembers = ngsMembers.map(member => new AugmentedNGSUser_1.AugmentedNGSUser(member));
        for (var teamMember of teamMembers) {
            const lowerCaseDisplayName = teamMember.displayName.toLowerCase();
            if (lowerCaseDisplayName == captainName) {
                teamMember.IsCaptain = true;
            }
            else if (assistantCaptains === null || assistantCaptains === void 0 ? void 0 : assistantCaptains.find(ac => ac == lowerCaseDisplayName)) {
                teamMember.IsAssistantCaptain = true;
            }
        }
        return teamMembers;
    }
    GetFreshTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredTeams = yield this.GetRegisteredTeams();
            if (registeredTeams.length >= 0)
                return registeredTeams;
            else
                return yield this.GetTeamsFromDivisionList();
        });
    }
    GetTeamsFromDivisionList() {
        return __awaiter(this, void 0, void 0, function* () {
            let allTeams = [];
            const divisions = yield this.GetDivisions();
            let teamnames = [];
            if (divisions.length <= 0) {
                const teamsByDivions = divisions.map(d => d.teams);
                teamnames = teamsByDivions.reduce((a, b) => a.concat(b), []);
            }
            else {
                return yield this.GetRegisteredTeams();
            }
            for (let teamName of teamnames) {
                try {
                    const teamResponse = yield new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse(`/team/get?team=${encodeURIComponent(teamName)}`);
                    allTeams.push(teamResponse);
                }
                catch (e) {
                    Globals_1.Globals.log(`/team/get?team=${encodeURIComponent(teamName)}`);
                }
            }
            return allTeams;
        });
    }
}
exports.LiveDataStore = LiveDataStore;
//# sourceMappingURL=LiveDataStore.js.map