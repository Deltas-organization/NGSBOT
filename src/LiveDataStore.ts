
import { Globals } from './Globals';
import { Cacher } from './helpers/Cacher';
import { NGSQueryBuilder } from './helpers/NGSQueryBuilder';
import { INGSDivision, INGSSchedule, INGSTeam, INGSUser } from './interfaces';

export class LiveDataStore {
    private cachedDivisions = new Cacher<INGSDivision[]>(60 * 24);
    private cachedSchedule = new Cacher<INGSSchedule[]>(60);
    private cachedUsers = new Cacher<INGSUser[]>(60);
    private cachedTeams = new Cacher<INGSTeam[]>(60 * 24);
    private cachedRegisteredTeams = new Cacher<INGSTeam[]>(60 * 24);

    public Clear()
    {
        this.cachedDivisions.Clear();
        this.cachedSchedule.Clear();
        this.cachedUsers.Clear();
        this.cachedTeams.Clear();
        this.cachedRegisteredTeams.Clear();
    }

    public async GetDivisions(): Promise<INGSDivision[]> {
        return this.cachedDivisions.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSDivision[]>('/division/get/all'));
    }

    public GetSchedule(): Promise<INGSSchedule[]> | INGSSchedule[] {
        return this.cachedSchedule.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSSchedule[]>('/schedule/get/matches/scheduled?season=11'));
    }

    public async GetUsers(): Promise<INGSUser[]> {
        return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
    }

    public async GetTeams(): Promise<INGSTeam[]> {
        return this.cachedTeams.TryGetFromCache(() => this.GetFreshTeams());
    }

    private async GetRegisteredTeams(): Promise<INGSTeam[]> {
        return this.cachedRegisteredTeams.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSTeam[]>('/team/get/registered'));
    }

    private async GetFreshUsers(): Promise<INGSUser[]> {
        let allUsers = [];
        const teams = await this.GetTeams();
        for (let team of teams) {
            try {
                var encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                const teamMembers = await new NGSQueryBuilder().GetResponse<INGSUser[]>(`/user/get?users=${encodedUsers.join()}`);
                allUsers = allUsers.concat(teamMembers);
            }
            catch (e) {
                Globals.log(`Problem Retrieving division ${team.divisionName} team: ${team.teamName}  users: ${team.teamMembers?.map(member => member.displayName)}}`);
            }
        }

        return allUsers;
    }

    private async GetFreshTeams(): Promise<INGSTeam[]> {
        const registeredTeams = await this.GetRegisteredTeams();
        if (registeredTeams.length >= 0)
            return registeredTeams;
        else
            return await this.GetTeamsFromDivisionList();
    }

    private async GetTeamsFromDivisionList(): Promise<INGSTeam[]> {
        let allTeams: INGSTeam[] = [];
        const divisions = await this.GetDivisions();
        let teamnames: string[] = [];
        if (divisions.length <= 0) {
            const teamsByDivions = divisions.map(d => d.teams);
            teamnames = teamsByDivions.reduce((a, b) => a.concat(b), []);
        }
        else {
            return await this.GetRegisteredTeams();
        }
        for (let teamName of teamnames) {
            try {
                const teamResponse = await new NGSQueryBuilder().GetResponse<INGSTeam>(`/team/get?team=${encodeURIComponent(teamName)}`);
                allTeams.push(teamResponse);
            }
            catch (e) {
                Globals.log(`/team/get?team=${encodeURIComponent(teamName)}`);
            }
        }
        return allTeams;
    }
}
