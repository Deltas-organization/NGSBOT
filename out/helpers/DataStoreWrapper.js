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
exports.DataStoreWrapper = void 0;
const Globals_1 = require("../Globals");
class DataStoreWrapper {
    constructor(_dataStore) {
        this._dataStore = _dataStore;
    }
    GetTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._dataStore.GetRegisteredTeams();
        });
    }
    GetSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._dataStore.GetSchedule();
        });
    }
    GetUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._dataStore.GetUsers();
        });
    }
    GetUsersByApi(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._dataStore.GetUsersByApi(searchTerm)).filter(user => user.bNetId);
        });
    }
    GetDivisions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._dataStore.GetDivisions();
        });
    }
    GetTeamsBySeason(season) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._dataStore.GetTeamsBySeason(season);
        });
    }
    // public GetMatches(round: number)
    // {
    //     return this._dataStore.GetMatches(round);
    // }
    Clear() {
        this._dataStore.Clear();
    }
    LookForRegisteredTeam(ngsUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let validTeams = yield this.SearchForRegisteredTeams(ngsUser.teamName);
                if (validTeams.length == 1) {
                    return validTeams[0];
                }
            }
            catch (ex) {
                Globals_1.Globals.log(ex);
            }
        });
    }
    SearchForRegisteredTeams(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allTeams = yield this.GetTeams();
                const searchRegex = new RegExp(searchTerm, 'i');
                return allTeams.filter(team => searchRegex.test(team.teamName));
            }
            catch (ex) {
                Globals_1.Globals.log(ex);
            }
        });
    }
    SearchForTeamBySeason(season, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allTeams = yield this.GetTeamsBySeason(season);
                const searchRegex = new RegExp(searchTerm, 'i');
                return allTeams.filter(team => searchRegex.test(team.teamName));
            }
            catch (ex) {
                Globals_1.Globals.log(ex);
            }
        });
    }
    SearchForUsers(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.GetUsers();
            const searchRegex = new RegExp(searchTerm, 'i');
            return users.filter(p => searchRegex.test(p.displayName));
        });
    }
    GetUsersOnTeam(team) {
        return __awaiter(this, void 0, void 0, function* () {
            let teamName;
            if (typeof team === "string")
                teamName = team;
            else
                teamName = team.teamName;
            const users = yield this.GetUsers();
            return users.filter(user => user.teamName == teamName);
        });
    }
}
exports.DataStoreWrapper = DataStoreWrapper;
//# sourceMappingURL=DataStoreWrapper.js.map