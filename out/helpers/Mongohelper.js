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
    addScheduleRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.ngsDatabase.collection("ScheduleRequest");
            var selectOneFilter = { channelId: { $eq: request.channelId } };
            const existingRecord = yield collection.findOne(selectOneFilter);
            if (existingRecord) {
                existingRecord.divisions = [...new Set([...existingRecord.divisions, ...request.divisions])];
                yield collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
                return existingRecord;
            }
            else {
                yield collection.insertOne(request);
                return request;
            }
        });
    }
}
exports.Mongohelper = Mongohelper;
//# sourceMappingURL=Mongohelper.js.map