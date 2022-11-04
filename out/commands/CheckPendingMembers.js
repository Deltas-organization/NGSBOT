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
exports.CheckPendingMembers = void 0;
const NGSQueryBuilder_1 = require("../helpers/NGSQueryBuilder");
const TeamSorter_1 = require("../helpers/TeamSorter");
const MessageContainer_1 = require("../message-helpers/MessageContainer");
const MongoCollections_1 = require("../mongo/models/MongoCollections");
class CheckPendingMembers {
    constructor(apiKey, dataStore, mongoHelper) {
        this.apiKey = apiKey;
        this.dataStore = dataStore;
        this.mongoHelper = mongoHelper;
    }
    GetMembersPendingMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            var currentPendingMembers = yield this.GetMembersPendingFromNGS();
            var membersInMongo = yield this.GetMembersPendingFromMongo();
            var pendingInBoth = this.PendingInBoth(currentPendingMembers, membersInMongo);
            yield this.AddToMongoNewPendings(currentPendingMembers, membersInMongo);
            yield this.RemoveMongoNoLongerPendings(currentPendingMembers, membersInMongo);
            var pendingsWithDivision = yield this.AddDivisionToPendings(pendingInBoth);
            return this.CreateMessage(pendingsWithDivision);
        });
    }
    GetMembersPendingFromNGS() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new NGSQueryBuilder_1.NGSQueryBuilder().GetSecuredResponse("/admin/pendingMemberQueue", this.apiKey);
        });
    }
    GetMembersPendingFromMongo() {
        return __awaiter(this, void 0, void 0, function* () {
            var result = yield this.mongoHelper.GetAllFromCollection(MongoCollections_1.MongoCollections.PendingMembers);
            if (!result) {
                result = [];
            }
            return result;
        });
    }
    PendingInBoth(ngsPendingMembers, mongoPendingMembers) {
        var result = [];
        for (var ngsPendingMember of ngsPendingMembers) {
            for (var mongoPendingMember of mongoPendingMembers) {
                if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                    result.push(ngsPendingMember);
                    continue;
                }
            }
        }
        return result;
    }
    AddToMongoNewPendings(ngsPendingMembers, mongoPendingMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            var newMembersToAdd = [];
            for (var ngsPendingMember of ngsPendingMembers) {
                var found = false;
                for (var mongoPendingMember of mongoPendingMembers) {
                    if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                        found = true;
                        continue;
                    }
                }
                if (!found)
                    newMembersToAdd.push(ngsPendingMember);
            }
            if (newMembersToAdd.length > 0)
                yield this.mongoHelper.AddMultipleToCollection(MongoCollections_1.MongoCollections.PendingMembers, newMembersToAdd);
        });
    }
    RemoveMongoNoLongerPendings(ngsPendingMembers, mongoPendingMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            var removePromises = [];
            for (var mongoPendingMember of mongoPendingMembers) {
                var found = false;
                for (var ngsPendingMember of ngsPendingMembers) {
                    if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                        found = true;
                        continue;
                    }
                }
                if (!found)
                    removePromises.push(this.mongoHelper.RemovePendingMember(mongoPendingMember));
            }
            yield Promise.all(removePromises);
        });
    }
    AddDivisionToPendings(pendingInBoth) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = [];
            var teams = yield this.dataStore.GetTeams();
            for (var pending of pendingInBoth) {
                var found = false;
                for (var team of teams.Teams) {
                    if (pending.teamName == team.teamName) {
                        found = true;
                        result.push({ pendingMember: pending, division: team.divisionDisplayName });
                    }
                }
                if (!found)
                    result.push({ pendingMember: pending, division: "UNPLACED" });
            }
            return result;
        });
    }
    CreateMessage(pendingsWithDivision) {
        const messageContainer = new MessageContainer_1.MessageContainer();
        const sortedPendings = pendingsWithDivision.sort((item1, item2) => TeamSorter_1.TeamSorter.SortByDivision(item1.division, item2.division));
        const groupedbyDivisionPendings = sortedPendings.reduce(function (r, a) {
            r[a.division] = r[a.division] || [];
            r[a.division].push(a.pendingMember);
            return r;
        }, Object.create(null));
        for (const pendingGroupKey in groupedbyDivisionPendings) {
            const divisionName = pendingGroupKey;
            let pendingMembers = groupedbyDivisionPendings[pendingGroupKey];
            const groupedByTeamName = pendingMembers.reduce(function (r, a) {
                r[a.teamName] = r[a.teamName] || [];
                r[a.teamName].push(a);
                return r;
            }, Object.create(null));
            const newMessageGroup = new MessageContainer_1.MessageGroup();
            newMessageGroup.AddOnNewLine(`Pending Roster Adds For Division: **${divisionName}**`);
            for (const groupedByTeamKey in groupedByTeamName) {
                var teamName = groupedByTeamKey;
                var groupedMembers = groupedByTeamName[groupedByTeamKey];
                newMessageGroup.AddOnNewLine(`Team`, 2);
                newMessageGroup.AddOnNewLine(`**${teamName}**`, 2);
                newMessageGroup.AddOnNewLine(`Users`, 4);
                for (var member of groupedMembers) {
                    newMessageGroup.AddOnNewLine(`**${member.userName}**`, 4);
                }
                newMessageGroup.AddEmptyLine();
            }
            messageContainer.Append(newMessageGroup);
        }
        return messageContainer;
    }
}
exports.CheckPendingMembers = CheckPendingMembers;
;
//# sourceMappingURL=CheckPendingMembers.js.map