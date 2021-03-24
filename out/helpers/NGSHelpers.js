"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGSHelpers = void 0;
class NGSHelpers {
    static SearchforTeam(allTeams, searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        return allTeams.filter(team => searchRegex.test(team.teamName));
    }
}
exports.NGSHelpers = NGSHelpers;
//# sourceMappingURL=NGSHelpers.js.map