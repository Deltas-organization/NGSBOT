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
const Cacher_1 = require("./helpers/Cacher");
const QueryBuilder_1 = require("./helpers/QueryBuilder");
class LiveDataStore {
    constructor() {
        this.cachedDivisions = new Cacher_1.Cacher(60 * 24);
        this.cachedSchedule = new Cacher_1.Cacher(60);
    }
    GetDivisions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cachedDivisions.TryGetFromCache(() => new QueryBuilder_1.QueryBuilder().GetResponse('/division/get/all'));
        });
    }
    GetSchedule() {
        return this.cachedSchedule.TryGetFromCache(() => new QueryBuilder_1.QueryBuilder().GetResponse('/schedule/get/matches/scheduled?season=10'));
    }
    FindTeams(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const validTeams = yield this.GetValidTeams(searchTerm);
            const response = [];
            for (var index = 0; index < validTeams.length; index++) {
                let encodedName = escape(validTeams[index]);
                let teamRespose = yield new QueryBuilder_1.QueryBuilder().GetResponse(`/team/get?team=${encodedName}`);
                response.push(teamRespose);
            }
            return response;
        });
    }
    GetValidTeams(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const divisions = yield this.GetDivisions();
            const allTeamNames = [].concat(...divisions.map(d => d.teams));
            const searchRegex = new RegExp(searchTerm, 'i');
            const validTeams = [];
            for (var index = 0; index < allTeamNames.length; index++) {
                const teamName = allTeamNames[index];
                if (searchRegex.test(teamName))
                    validTeams.push(teamName);
            }
            return validTeams;
        });
    }
}
exports.LiveDataStore = LiveDataStore;
//# sourceMappingURL=LiveDataStore.js.map