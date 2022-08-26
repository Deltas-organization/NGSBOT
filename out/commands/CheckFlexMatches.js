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
exports.CheckFlexMatches = void 0;
const Globals_1 = require("../Globals");
const TeamSorter_1 = require("../helpers/TeamSorter");
const MessageContainer_1 = require("../message-helpers/MessageContainer");
class CheckFlexMatches {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }
    Check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var result = new MessageContainer_1.MessageContainer();
                var unscheduledFlexMatch = [];
                var unscheduledFlexMatch = yield this.dataStore.GetUnScheduledFlexMatches();
                unscheduledFlexMatch = unscheduledFlexMatch.sort((i1, i2) => TeamSorter_1.TeamSorter.SortByDivisionConcat(i1.divisionConcat, i2.divisionConcat));
                var lastDivision = null;
                var currentDivisionMessage = null;
                for (var match of unscheduledFlexMatch) {
                    if (!match.divisionConcat)
                        continue;
                    try {
                        if (lastDivision != match.divisionConcat) {
                            currentDivisionMessage = new MessageContainer_1.MessageGroup();
                            currentDivisionMessage.AddOnNewLine(`UnScheduled Flex Matches For Division: **${match.divisionConcat}**`);
                            result.Append(currentDivisionMessage);
                            lastDivision = match.divisionConcat;
                        }
                        currentDivisionMessage === null || currentDivisionMessage === void 0 ? void 0 : currentDivisionMessage.AddOnNewLine(`**${match.home.teamName}** vs **${match.away.teamName}**`);
                    }
                    catch (e) {
                        Globals_1.Globals.log("Problem", match, e);
                    }
                }
                return result;
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
}
exports.CheckFlexMatches = CheckFlexMatches;
//# sourceMappingURL=CheckFlexMatches.js.map