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
        this.LoadDate(this._defaultFileName);
    }
    LoadPrevious(index) {
        if (this.Data.LastFileNames.length > index)
            index = this.Data.LastFileNames.length - 1;
        if (index < 0)
            index = 0;
        this.LoadDate(this.Data.LastFileNames[index]);
    }
    CurrentVersionDate() {
        var ticksToMicrotime = this.Data.DateTicks / 10000;
        return new Date(ticksToMicrotime - this._epochMicrotimeDiff);
    }
    GetVersionFriendlyName() {
        return this.CurrentVersionDate().toLocaleDateString('en-US');
    }
    LoadDate(fileName) {
        let rawdata = fs.readFileSync(this._baseLocation + fileName + '.json');
        this.Data = JSON.parse(rawdata);
        this.PlayerData = this.Data.Players;
        this.TeamData = this.Data.Teams;
        this.DivisionData = this.Data.Divisions;
    }
}
exports.NGSDataStore = NGSDataStore;
//# sourceMappingURL=NGSDataStore.js.map