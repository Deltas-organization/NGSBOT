import { INGSFileResponse } from "./interfaces/INGSFileResponse";
import { INGSPlayer } from "./interfaces/INGSPlayer";
import { INGSTeam } from "./interfaces/INGSTeam";
import { INGSDivision } from "./interfaces/INGSDivision";

var fs = require('fs');

export class NGSDataStore {
    private _baseLocation = 'C:/Data/';
    private _defaultFileName = 'NGSPlayers';
    private _epochMicrotimeDiff: number;

    public Data: INGSFileResponse;
    public PlayerData: INGSPlayer[];
    public TeamData: INGSTeam[];
    public DivisionData: INGSDivision[];

    constructor() {
        this.ReloadData();
        this._epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));
    }

    public ReloadData() {
        this.LoadDate(this._defaultFileName);
    }

    public LoadPrevious(index: number) {
        if (this.Data.LastFileNames.length > index)
            index = this.Data.LastFileNames.length - 1;
        if (index < 0)
            index = 0;
            
        this.LoadDate(this.Data.LastFileNames[index]);
    }

    public CurrentVersionDate() {
        var ticksToMicrotime = this.Data.DateTicks / 10000;
        return new Date(ticksToMicrotime - this._epochMicrotimeDiff);
    }

    public GetVersionFriendlyName() {
        return this.CurrentVersionDate().toLocaleDateString('en-US');
    }

    private LoadDate(fileName: string) {
        let rawdata = fs.readFileSync(this._baseLocation + fileName + '.json');
        this.Data = JSON.parse(rawdata);
        this.PlayerData = this.Data.Players;
        this.TeamData = this.Data.Teams;
        this.DivisionData = this.Data.Divisions;

    }
}