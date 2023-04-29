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
    constructor(connectionUri, databaseToConnectTo = "NGS") {
        this.client = new mongoDB.MongoClient(connectionUri, { useUnifiedTopology: true });
        this.setup(databaseToConnectTo);
    }
    setup(databaseToConnectTo) {
        this.connectedPromise = new Promise((resolver, rejector) => __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
            if (databaseToConnectTo == "NGS")
                this.connectedDatabase = this.client.db("NGS");
            else if (databaseToConnectTo == "DBD")
                this.connectedDatabase = this.client.db("DeadByDaylight");
            resolver();
        }));
    }
    GetAllFromCollection(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.connectedDatabase.collection(collectionName);
            return collection.find().toArray();
        });
    }
    AddToCollection(collectionName, newRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.connectedDatabase.collection(collectionName);
            yield collection.insertOne(newRecord);
        });
    }
    AddMultipleToCollection(collectionName, newRecords) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            var collection = this.connectedDatabase.collection(collectionName);
            yield collection.insertMany(newRecords);
        });
    }
}
exports.Mongohelper = Mongohelper;
//# sourceMappingURL=Mongohelper.js.map