
import { Cacher } from './helpers/Cacher';
import { QueryBuilder } from './helpers/QueryBuilder';
import { INGSSchedule, INGSUser } from './interfaces';

export class LiveDataStore {
    private cachedDivisions = new Cacher<INGSDivision[]>(60 * 24);
    private cachedSchedule = new Cacher<INGSSchedule[]>(60);
    private cachedUsers = new Cacher<INGSUser[]>(60);

    public async GetDivisions(): Promise<INGSDivision[]> {
        return this.cachedDivisions.TryGetFromCache(() => new QueryBuilder().GetResponse<INGSDivision[]>('/division/get/all'));
    }

    public GetSchedule(): Promise<INGSSchedule[]> | INGSSchedule[] {
        return this.cachedSchedule.TryGetFromCache(() => new QueryBuilder().GetResponse<INGSSchedule[]>('/schedule/get/matches/scheduled?season=10'));
    }

    public async GetUsers(): Promise<INGSUser[]>
    {
        return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
    }

    private async GetFreshUsers(): Promise<INGSUser[]>
    {
        let allUsers = [];
        const divisions = await this.GetDivisions();
        for(let division of divisions)
        {
            for(let team of division.teams)
            {
                try
                {
                    console.log(`/team/get?team=${escape(team)}`);
                    const teamResponse = await new QueryBuilder().GetResponse<INGSTeam>(`/team/get?team=${escape(team)}`);
                    const encodedUsers = teamResponse.teamMembers.map(member => escape(member.displayName));
                    const teamMembers = await new QueryBuilder().GetResponse<INGSUser[]>(`/user/get?users=${encodedUsers.join()}`);
                    allUsers = allUsers.concat(teamMembers);
                }
                catch (e)
                {
                    console.log(`/team/get?team=${escape(team)}`);
                }
            }
        }

        return allUsers;
    }

    public async FindTeams(searchTerm: string): Promise<INGSTeam[]> {
        const validTeams = await this.GetValidTeams(searchTerm);
        const response: INGSTeam[] = [];
        for (var index = 0; index < validTeams.length; index++) {
            let encodedName = escape(validTeams[index]);
            let teamRespose = await new QueryBuilder().GetResponse<INGSTeam>(`/team/get?team=${encodedName}`);
            response.push(teamRespose);
        }
        return response;
    }

    private async GetValidTeams(searchTerm: string) {
        const divisions = await this.GetDivisions();
        const allTeamNames: string[] = [].concat(...divisions.map(d => d.teams));
        const searchRegex = new RegExp(searchTerm, 'i');
        const validTeams = [];
        for (var index = 0; index < allTeamNames.length; index++) {
            const teamName = allTeamNames[index];
            if (searchRegex.test(teamName))
                validTeams.push(teamName);
        }
        return validTeams;
    }
}

export interface INGSDivision {
    teams: string[];
    displayName: string;
    moderator: string;
}

export interface INGSTeam {
    teamMembers: [{ displayName: string }];
    captain: string;
    teamName: string;
    divisionDisplayName: string;
    assistantCaptain: string[];
    descriptionOfTeam: string;
}