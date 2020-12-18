
import { Globals } from './Globals';
import { Cacher } from './helpers/Cacher';
import { QueryBuilder } from './helpers/QueryBuilder';
import { INGSSchedule, INGSUser } from './interfaces';

export class LiveDataStore {
    private cachedDivisions = new Cacher<INGSDivision[]>(60 * 24);
    private cachedSchedule = new Cacher<INGSSchedule[]>(60);
    private cachedUsers = new Cacher<INGSUser[]>(60);
    private cachedTeams = new Cacher<INGSTeam[]>(60 * 24);

    public async GetDivisions(): Promise<INGSDivision[]> {
        return this.cachedDivisions.TryGetFromCache(() => new QueryBuilder().GetResponse<INGSDivision[]>('/division/get/all'));
    }

    public GetSchedule(): Promise<INGSSchedule[]> | INGSSchedule[] {
        return this.cachedSchedule.TryGetFromCache(() => new QueryBuilder().GetResponse<INGSSchedule[]>('/schedule/get/matches/scheduled?season=10'));
    }

    public async GetUsers(): Promise<INGSUser[]> {
        return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
    }

    public async GetTeams(): Promise<INGSTeam[]> {
        return this.cachedTeams.TryGetFromCache(() => this.GetFreshTeams());
    }

    private async GetFreshUsers(): Promise<INGSUser[]> {
        let allUsers = [];
        const teams = await this.GetTeams();
        for (let team of teams) {
            try {
                var encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                const teamMembers = await new QueryBuilder().GetResponse<INGSUser[]>(`/user/get?users=${encodedUsers.join()}`);
                allUsers = allUsers.concat(teamMembers);
            }
            catch (e) {
                Globals.log(`Problem Retrieving division ${team.divisionDisplayName} team: ${team.teamName}  users: ${team.teamMembers?.map(member => member.displayName)}}`);
            }
        }

        return allUsers;
    }

    private async GetFreshTeams(): Promise<INGSTeam[]> {
        let allTeams: INGSTeam[] = [];
        const divisions = await this.GetDivisions();
        for (let division of divisions) {
            for (let team of division.teams) {
                try {
                    const teamResponse = await new QueryBuilder().GetResponse<INGSTeam>(`/team/get?team=${encodeURIComponent(team)}`);
                    allTeams.push(teamResponse);
                }
                catch (e) {
                    Globals.log(`/team/get?team=${encodeURIComponent(team)}`);
                }
            }
        }
        return allTeams;
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