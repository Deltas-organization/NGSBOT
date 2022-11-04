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
exports.Mongohelper = void 0;
const mongoDB = require("mongodb");
const MongoCollections_1 = require("../mongo/models/MongoCollections");
class Mongohelper {
    constructor(connectionUri) {
        this.client = new mongoDB.MongoClient(connectionUri, { useUnifiedTopology: true });
        this.setup();
    }
    setup() {
        this.connectedPromise = new Promise((resolver, rejector) => __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
            this.ngsDatabase = this.client.db("NGS");
            resolver();
        }));
    }
    AddOrUpdateScheduleRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("ScheduleRequest");
            var selectOneFilter = { channelId: { $eq: request.channelId } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            if (existingRecord) {
                if (request.divisions) {
                    existingRecord.divisions = [...new Set([...existingRecord.divisions, ...request.divisions])];
                    yield collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
                    return existingRecord;
                }
                else {
                    console.log("no divisions found in AddOrUpdateScheduleRequest");
                }
            }
            else {
                yield collection.insertOne(request);
                return request;
            }
            return null;
        });
    }
    getRequestedSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            const result = [];
            var collection = this.ngsDatabase.collection("ScheduleRequest");
            yield collection.find().forEach(item => {
                result.push(item);
            });
            return result;
        });
    }
    AddOrUpdateAssignRoleRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("AssignRoleRequest");
            var selectOneFilter = { guildId: { $eq: request.guildId } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            if (existingRecord) {
                existingRecord.assignablesRoles = [...new Set([...existingRecord.assignablesRoles, ...request.assignablesRoles])];
                yield collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
                return existingRecord;
            }
            else {
                yield collection.insertOne(request);
                return request;
            }
        });
    }
    RemoveAssignedRoles(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("AssignRoleRequest");
            var selectOneFilter = { guildId: { $eq: request.guildId } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            if (existingRecord) {
                var rolesToAssign = existingRecord.assignablesRoles;
                for (const roleToRemove of request.assignablesRoles) {
                    const currentIndex = rolesToAssign.indexOf(roleToRemove);
                    if (currentIndex > -1) {
                        rolesToAssign.splice(currentIndex, 1);
                    }
                }
                existingRecord.assignablesRoles = rolesToAssign;
                yield collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
                return existingRecord;
            }
            else {
                return null;
            }
        });
    }
    GetAssignedRoleRequests(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("AssignRoleRequest");
            var selectOneFilter = { guildId: { $eq: guildId } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            if (existingRecord)
                return existingRecord.assignablesRoles;
            else
                return null;
        });
    }
    GetCaptainListMessageId(season, division) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("CaptainList");
            var selectOneFilter = { season: { $eq: season }, division: { $eq: division } };
            var existingMessage = yield collection.findOne(selectOneFilter);
            return existingMessage === null || existingMessage === void 0 ? void 0 : existingMessage.messageId;
        });
    }
    CreateCaptainListRecord(messageId, season, division) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("CaptainList");
            var newRecord = {
                season: season,
                messageId: messageId,
                division: division
            };
            yield collection.insertOne(newRecord);
            return newRecord;
        });
    }
    GetNgsInformation(season) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("SeasonInformation");
            var selectOneFilter = { season: { $eq: season } };
            var result = yield collection.findOne(selectOneFilter);
            if (!result) {
                result = {
                    season: season,
                    round: 1
                };
                yield collection.insertOne(result);
            }
            return result;
        });
    }
    UpdateSeasonRound(season) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("SeasonInformation");
            var selectOneFilter = { season: { $eq: season } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            existingRecord.round += 1;
            yield collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
            return existingRecord;
        });
    }
    RemovePendingMember(pendingMember) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection(MongoCollections_1.MongoCollections.PendingMembers);
            var selectOneQuery = { $and: [{ teamName: { $eq: pendingMember.teamName } }, { userName: { $eq: pendingMember.userName } }] };
            yield collection.deleteOne(selectOneQuery);
        });
    }
    GetAllFromCollection(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection(collectionName);
            return collection.find().toArray();
        });
    }
    AddToCollection(collectionName, newRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection(collectionName);
            yield collection.insertOne(newRecord);
        });
    }
    AddMultipleToCollection(collectionName, newRecords) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection(collectionName);
            yield collection.insertMany(newRecords);
        });
    }
}
exports.Mongohelper = Mongohelper;
//# sourceMappingURL=Mongohelper.js.map