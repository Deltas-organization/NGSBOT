
import { Globals } from './Globals';
import { Cacher } from './helpers/Cacher';
import { NGSQueryBuilder } from './helpers/NGSQueryBuilder';
import { INGSDivision, INGSSchedule, INGSTeam, INGSUser } from './interfaces';
import { AugmentedNGSUser } from './models/AugmentedNGSUser';

export class LiveDataStore {
    private cachedDivisions = new Cacher<INGSDivision[]>(60 * 24);
    private cachedSchedule = new Cacher<INGSSchedule[]>(60);
    private cachedUsers = new Cacher<AugmentedNGSUser[]>(60 * 24);
    private cachedTeams = new Cacher<INGSTeam[]>(60 * 24);
    private cachedRegisteredTeams = new Cacher<INGSTeam[]>(60 * 24);

    public Clear() {
        this.cachedDivisions.Clear();
        this.cachedSchedule.Clear();
        this.cachedUsers.Clear();
        this.cachedTeams.Clear();
        this.cachedRegisteredTeams.Clear();
    }

    public async GetDivisions(): Promise<INGSDivision[]> {
        return this.cachedDivisions.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSDivision[]>('/division/get/all'));
    }

    public async GetSchedule(): Promise<INGSSchedule[]> {
        return this.cachedSchedule.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSSchedule[]>('/schedule/get/matches/scheduled?season=11'));
    }

    public async GetUsers(): Promise<AugmentedNGSUser[]> {
        return this.cachedUsers.TryGetFromCache(() => this.GetFreshUsers());
    }

    public async GetTeams(): Promise<INGSTeam[]> {
        return this.cachedTeams.TryGetFromCache(() => this.GetFreshTeams());
    }

    // public async GetMatches(round: number): Promise<INGSSchedule[]> {
    //     return new NGSQueryBuilder().PostResponse<INGSSchedule[]>('/schedule/fetch/matches', {season: 11, round: round});
    // }

    private async GetRegisteredTeams(): Promise<INGSTeam[]> {
        return this.cachedRegisteredTeams.TryGetFromCache(() => new NGSQueryBuilder().GetResponse<INGSTeam[]>('/team/get/registered'));
    }

    private async GetFreshUsers(): Promise<AugmentedNGSUser[]> {
        let allUsers: AugmentedNGSUser[] = [];
        const teams = await this.GetTeams();
        for (let team of teams) {
            try {
                const encodedUsers = team.teamMembers.map(member => encodeURIComponent(member.displayName));
                const ngsMembers = await new NGSQueryBuilder().GetResponse<INGSUser[]>(`/user/get?users=${encodedUsers.join()}`);
                const teamMembers = this.AugmentNgsUsers(ngsMembers, team);
                allUsers = allUsers.concat(teamMembers);
            }
            catch (e) {
                Globals.log(`Problem Retrieving division ${team.divisionDisplayName} team: ${team.teamName}  users: ${team.teamMembers?.map(member => member.displayName)}}`);
            }
        }

        return allUsers;
    }
    
    private AugmentNgsUsers(ngsMembers: INGSUser[], team: INGSTeam) {        
        const captainName = team.captain.toLowerCase();
        const assistantCaptains = team.assistantCaptain.map(ac => ac.toLowerCase());
        const teamMembers = ngsMembers.map(member => new AugmentedNGSUser(member));
        for (var teamMember of teamMembers) {
            const lowerCaseDisplayName = teamMember.displayName.toLowerCase();
            if (lowerCaseDisplayName == captainName) {
                teamMember.IsCaptain = true;
            }
            else if (assistantCaptains?.find(ac => ac == lowerCaseDisplayName)) {
                teamMember.IsAssistantCaptain = true;
            }
        }
        return teamMembers;
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
