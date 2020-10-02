"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGSDataStore = void 0;
var fs = require('fs');
class NGSDataStore {
    constructor() {
        this._baseLocation = 'C:/Data/';
        this._defaultFileName = 'NGSPlayers';
        this.ReloadData();
        this._epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));
    }
    ReloadData() {
        // this.LoadDate(this._defaultFileName);
    }
    CurrentVersionDate() {
        var ticksToMicrotime = this.Data.DateTicks / 10000;
        return new Date(ticksToMicrotime - this._epochMicrotimeDiff);
    }
    GetVersionFriendlyName() {
        return this.CurrentVersionDate().toLocaleDateString('en-US');
    }
}
exports.NGSDataStore = NGSDataStore;
//# sourceMappingURL=NGSDataStore.js.map