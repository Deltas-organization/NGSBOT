import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { INGSDivision, INGSSchedule, INGSTeam } from "../interfaces";
import { LiveDataStore } from "../LiveDataStore";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { TeamHelper } from "./TeamHelper";

export class DataStoreWrapper {
    constructor(private _dataStore: LiveDataStore) {

    }

    public async GetTeams(): Promise<TeamHelper> {
        var teams = await this._dataStore.GetRegisteredTeams();
        return new TeamHelper(this, teams);
    }

    public async GetScheduledGames() {
        return this._dataStore.GetScheduledGames();
    }

    public async GetUnScheduledFlexMatches() {
        return this._dataStore.GetScheduleQuery({
            type: "seasonal",
            scheduleDeadline: { $exists: false },
            scheduledTime: { $exists: false },
            forfeit: { $exists: false }
        });
    }

    public async GetUsers() {
        return this._dataStore.GetUsers();
    }

    public async GetUsersByApi(searchTerm: string) {
        return (await this._dataStore.GetUsersByApi(searchTerm)).filter(user => (<any>user).bNetId);
    }

    public async GetDivisions(): Promise<INGSDivision[]> {
        return this._dataStore.GetDivisions();
    }

    public async GetTeamsBySeason(season: number) {
        return this._dataStore.GetTeamsBySeason(season);
    }

    public GetScheduleByRoundAndDivision(divisionConcat: string, round: number): Promise<INGSSchedule[]> {
        return this._dataStore.GetScheduleByRoundAndDivision(divisionConcat, round);
    }

    public Clear() {
        this._dataStore.Clear();
    }

    public async LookForRegisteredTeam(ngsUser: AugmentedNGSUser): Promise<INGSTeam> {
        try {
            let validTeams = await this.SearchForRegisteredTeams(ngsUser.teamName);
            if (validTeams.length == 1) {
                return validTeams[0];
            }
        }
        catch (ex) {
            Globals.log(ex);
        }
    }

    public async SearchForRegisteredTeams(searchTerm: string): Promise<INGSTeam[]> {
        return (await this.GetTeams()).SearchForTeam(searchTerm);
    }

    public async SearchForTeamBySeason(season: number, searchTerm: string): Promise<INGSTeam[]> {
        try {
            const allTeams = await this.GetTeamsBySeason(season);
            const searchRegex = new RegExp(searchTerm, 'i');
            return allTeams.filter(team => searchRegex.test(team.teamName));
        }
        catch (ex) {
            Globals.log(ex);
        }
    }

    public async SearchForUsers(searchTerm: string) {
        const users = await this.GetUsers();
        const searchRegex = new RegExp(searchTerm, 'i');
        return users.filter(p => searchRegex.test(p.displayName));
    }

    public async GetUsersOnTeam(team: string | INGSTeam) {
        let teamName;
        if (typeof team === "string")
            teamName = team;
        else
            teamName = team.teamName

        const users = await this.GetUsers();
        return users.filter(user => user.teamName == teamName);
    }
}