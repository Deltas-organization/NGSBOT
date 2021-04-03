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
        return this._dataStore.GetTeams();
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

    public Clear()
    {
        this._dataStore.Clear();
    }

    public async LookForTeam(ngsUser: AugmentedNGSUser)
    {
        try
        {
            const searchRegex = new RegExp(ngsUser.teamName, 'i');
            const allTeams = await this.GetTeams();
            let validTeams = allTeams.filter(team => searchRegex.test(team.teamName));
            if (validTeams.length == 1)
            {
                return validTeams[0];
            }
        }
        catch (ex)
        {
            console.log(ex);
        }
    }

    public async SearchForTeams(searchTerm: string)
    {
        try
        {
            const allTeams = await this.GetTeams();
            const searchRegex = new RegExp(searchTerm, 'i');
            return allTeams.filter(team => searchRegex.test(team.teamName));
        }
        catch (ex)
        {
            console.log(ex);
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
        const searchRegex = new RegExp(teamName, 'i');
        return users.filter(user => searchRegex.test(user.teamName));
    }
}