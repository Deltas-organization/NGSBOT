"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translationhelpers = void 0;
class Translationhelpers {
    static GetTeamURL(teamName) {
        return `[${teamName}](https://www.nexusgamingseries.org/teamProfile/${teamName.replace(/ /g, '_')})`;
    }
}
exports.Translationhelpers = Translationhelpers;
//# sourceMappingURL=TranslationHelpers.js.map