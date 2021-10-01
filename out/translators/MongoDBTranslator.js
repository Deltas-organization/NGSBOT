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
exports.MongoDBTranslator = void 0;
const MongoDBWorker_1 = require("../workers/MongoDBWorker");
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
const Mongoose = require("mongoose");
class MongoDBTranslator extends deltaTranslatorBase_1.DeltaTranslatorBase {
    constructor(translatorDependencies, connectionUri) {
        super(translatorDependencies);
        this.connectionUri = connectionUri;
        this.setup();
    }
    get commandBangs() {
        return ["mongo", "mongodb"];
    }
    get description() {
        return "Will run mongo queries.";
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            Mongoose.connect(this.connectionUri, {
                useNewUrlParser: true,
                useFindAndModify: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            });
            const database = Mongoose.connection;
            database.once("open", () => __awaiter(this, void 0, void 0, function* () {
                console.log("Connected to database");
                let cursor = database.collection("restaurants").find();
                cursor.forEach(item => {
                    console.log(item);
                });
            }));
        });
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = new MongoDBWorker_1.MongoDBWorker(this.translatorDependencies, detailed, messageSender);
            yield worker.Begin(commands);
        });
    }
}
exports.MongoDBTranslator = MongoDBTranslator;
//# sourceMappingURL=MongoDBTranslator.js.map