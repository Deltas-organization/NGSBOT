import { Globals } from "../Globals";
import { INGSTeam } from "../interfaces";
import { LiveDataStore } from "../LiveDataStore";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class DataStoreWrapper
{
    constructor(private _dataStore: LiveDataStore)
    {

    }

    public async GetTeams()
    {
        return this._dataStore.GetRegisteredTeams();
    }

    public async GetSchedule()
    {
        return this._dataStore.GetSchedule();
    }

    public async GetUsers()
    {
        return this._dataStore.GetUsers();
    }

    public async GetDivisions()
    {
        return this._dataStore.GetDivisions();
    }

    public async GetTeamsBySeason(season: number)
    {
        return this._dataStore.GetTeamsBySeason(season);
    }

    // public GetMatches(round: number)
    // {
    //     return this._dataStore.GetMatches(round);
    // }

    public Clear()
    {
        this._dataStore.Clear();
    }

    public async LookForRegisteredTeam(ngsUser: AugmentedNGSUser):Promise<INGSTeam>
    {
        try
        {
            let validTeams = await this.SearchForRegisteredTeams(ngsUser.teamName);
            if (validTeams.length == 1)
            {
                return validTeams[0];
            }
        }
        catch (ex)
        {
            Globals.log(ex);
        }
    }

    public async SearchForRegisteredTeams(searchTerm: string) :Promise<INGSTeam[]>
    {
        try
        {
            const allTeams = await this.GetTeams();
            const searchRegex = new RegExp(searchTerm, 'i');
            return allTeams.filter(team => searchRegex.test(team.teamName));
        }
        catch (ex)
        {
            Globals.log(ex);
        }
    }

    public async SearchForTeamBySeason(season: number, searchTerm: string): Promise<INGSTeam[]>
    {
        try
        {
            const allTeams = await this.GetTeamsBySeason(season);
            const searchRegex = new RegExp(searchTerm, 'i');
            return allTeams.filter(team => searchRegex.test(team.teamName));
        }
        catch (ex)
        {
            Globals.log(ex);
        }
    }

    public async SearchForUsers(searchTerm: string)
    {
        const users = await this.GetUsers();
        const searchRegex = new RegExp(searchTerm, 'i');
        return users.filter(p => searchRegex.test(p.displayName));
    }

    public async GetUsersOnTeam(team: string | INGSTeam)
    {
        let teamName;
        if (typeof team === "string")        
            teamName = team;        
        else
            teamName = team.teamName

        const users = await this.GetUsers();
        return users.filter(user => user.teamName == teamName);
    }
}