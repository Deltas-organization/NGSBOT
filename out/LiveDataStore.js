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
const QueryBuilder_1 = require("./helpers/QueryBuilder");
class LiveDataStore {
    constructor() {
        this.cachedDivisions = new Cacher_1.Cacher(60 * 24);
        this.cachedSchedule = new Cacher_1.Cacher(60);
        this.cachedUsers = new Cacher_1.Cacher(60);
        this.cachedTeams = new Cacher_1.Cacher(60 * 24);
    }
    GetDivisions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedDivisions.TryGetFromCache(() => new QueryBuilder_1.QueryBuilder().GetResponse('/division/get/all'));
        });
    }
    GetSchedule() {
        return this.cachedSchedule.TryGetFromCache(() => new QueryBuilder_1.QueryBuilder().GetResponse('/schedule/get/matches/scheduled?season=10'));
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
    GetFreshUsers() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let allUsers = [];
            const teams = yield this.GetTeams();
            for (let team of teams) {
                try {
                    var encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                    const teamMembers = yield new QueryBuilder_1.QueryBuilder().GetResponse(`/user/get?users=${encodedUsers.join()}`);
                    allUsers = allUsers.concat(teamMembers);
                }
                catch (e) {
                    Globals_1.Globals.log(`Problem Retrieving division ${team.divisionDisplayName} team: ${team.teamName}  users: ${(_a = team.teamMembers) === null || _a === void 0 ? void 0 : _a.map(member => member.displayName)}}`);
                }
            }
            return allUsers;
        });
    }
    GetFreshTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            let allTeams = [];
            const divisions = yield this.GetDivisions();
            for (let division of divisions) {
                for (let team of division.teams) {
                    try {
                        const teamResponse = yield new QueryBuilder_1.QueryBuilder().GetResponse(`/team/get?team=${encodeURIComponent(team)}`);
                        allTeams.push(teamResponse);
                    }
                    catch (e) {
                        Globals_1.Globals.log(`/team/get?team=${encodeURIComponent(team)}`);
                    }
                }
            }
            return allTeams;
        });
    }
}
exports.LiveDataStore = LiveDataStore;
//# sourceMappingURL=LiveDataStore.js.map