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
exports.ReplayCommandWorker = void 0;
const ChannelMessageSender_1 = require("../../helpers/messageSenders/ChannelMessageSender");
const Mongohelper_1 = require("../../helpers/Mongohelper");
const LiveDataStore_1 = require("../../LiveDataStore");
class ReplayCommandWorker {
    constructor(client, dataStore, mongoConnectionUri) {
        this.client = client;
        this.dataStore = dataStore;
        this.mongoConnectionUri = mongoConnectionUri;
        this._season = +LiveDataStore_1.LiveDataStore.season;
        this._mongoHelper = new Mongohelper_1.Mongohelper(this.mongoConnectionUri);
        this._messageSender = new ChannelMessageSender_1.ChannelMessageSender(this.client);
    }
    Run() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.ReplayCommandWorker = ReplayCommandWorker;
//# sourceMappingURL=ReplayCommandWorker.js.map