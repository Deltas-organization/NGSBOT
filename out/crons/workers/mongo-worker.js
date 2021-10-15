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
exports.MongoWorker = void 0;
const mongoDB = require("mongodb");
class MongoWorker {
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
}
exports.MongoWorker = MongoWorker;
//# sourceMappingURL=mongo-worker.js.map