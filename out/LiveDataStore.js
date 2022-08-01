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
const ListCacher_1 = require("./helpers/ListCacher");
const NGSQueryBuilder_1 = require("./helpers/NGSQueryBuilder");
const AugmentedNGSUser_1 = require("./models/AugmentedNGSUser");
let LiveDataStore = /** @class */ (() => {
    class LiveDataStore {
        constructor(_apiKey) {
            this._apiKey = _apiKey;
            this.cachedDivisions = new Cacher_1.Cacher(60 * 24);
            this.cachedScheduled = new Cacher_1.Cacher(60);
            this.cachedSchedule = new Cacher_1.Cacher(60);
            this.cachedUsers = new Cacher_1.Cacher(60 * 24);
            this.cachedTeams = new Cacher_1.Cacher(60 * 24);
            this.cachedRegisteredTeams = new Cacher_1.Cacher(60 * 24);
            this.cachedSeasonTeams = new ListCacher_1.ListCacher(60 * 24);
        }
        Clear() {
            this.cachedDivisions.Clear();
            this.cachedScheduled.Clear();
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
        GetScheduledGames() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.cachedScheduled.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse(`/schedule/get/matches/scheduled?season=${LiveDataStore.season}`));
            });
        }
        GetScheduleQuery(queryItem) {
            return __awaiter(this, void 0, void 0, function* () {
                var season = LiveDataStore.season;
                if (queryItem[season])
                    season = queryItem[season];
                var postRequest = {
                    apiKey: this._apiKey,
                    season: season
                };
                postRequest = Object.assign(Object.assign({}, postRequest), queryItem);
                return this.cachedSchedule.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().PostResponse('schedule/query/matches', postRequest));
            });
        }
        GetScheduleByRoundAndDivision(divisionConcat, round) {
            return __awaiter(this, void 0, void 0, function* () {
                return new NGSQueryBuilder_1.NGSQueryBuilder().PostResponse('schedule/fetch/matches', {
                    division: divisionConcat,
                    round: round,
                    season: LiveDataStore.season
                });
            });
        }
        GetUsers() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
            });
        }
        GetUsersByApi(searchTerm) {
            return __awaiter(this, void 0, void 0, function* () {
                return new NGSQueryBuilder_1.NGSQueryBuilder().PostResponse('search/user', {
                    userName: searchTerm,
                    apiKey: this._apiKey,
                    fullProfile: true
                });
            });
        }
        GetRegisteredTeams() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.cachedTeams.TryGetFromCache(() => this.GetFreshTeams());
            });
        }
        GetTeamsBySeason(season) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.cachedSeasonTeams.TryGetFromCache(season, () => __awaiter(this, void 0, void 0, function* () {
                    const teamResponse = yield new NGSQueryBuilder_1.NGSQueryBuilder().PostResponse(`/history/season/teams`, { "season": season });
                    return teamResponse.map(response => response.object);
                }));
            });
        }
        RetrieveRegisteredTeams() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.cachedRegisteredTeams.TryGetFromCache(() => new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse('/team/get/registered'));
            });
        }
        GetFreshUsers() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let allUsers = [];
                const teams = yield this.RetrieveRegisteredTeams();
                for (let team of teams) {
                    try {
                        const encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                        const ngsMembers = yield new NGSQueryBuilder_1.NGSQueryBuilder().GetResponse(`/user/get?users=${encodedUsers.join()}`);
                        const teamMembers = AugmentedNGSUser_1.AugmentedNGSUser.CreateFromMultiple(ngsMembers, team);
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
                const registeredTeams = yield this.RetrieveRegisteredTeams();
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
                    return [];
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
    LiveDataStore.season = '14';
    return LiveDataStore;
})();
exports.LiveDataStore = LiveDataStore;
//# sourceMappingURL=LiveDataStore.js.map