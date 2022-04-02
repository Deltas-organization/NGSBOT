import { User } from "discord.js";
import { Globals } from "../Globals";
import { INGSTeam } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { DataStoreWrapper } from "./DataStoreWrapper";
import { DiscordFuzzySearch } from "./DiscordFuzzySearch";
import { RoleHelper } from "./RoleHelper";
import { TeamSorter } from "./TeamSorter";

export class TeamHelper {

    public Teams: INGSTeam[];
    public length: number;

    constructor(private dataStore: DataStoreWrapper, private teams: INGSTeam[]) {
        this.Teams = teams;
        this.length = teams.length;
    }

    public async FindUserInTeam(guildUser: User): Promise<AugmentedNGSUser> {
        for (var team of this.teams) {
            const teamName = team.teamName;
            const allUsers = await this.dataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            for (var ngsUser of teamUsers) {
                const foundGuildUser = DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser)
                if (foundGuildUser) {
                    return ngsUser;
                }
            }
        }

        return null;
    }

    public async FindUsersOnTeam(teamName: string) {
        var result: AugmentedNGSUser[] = [];
        for (let team of this.teams) {
            if (teamName == team.teamName) {
                const users = await this.dataStore.GetUsersOnTeam(team);
                for (var user of users) {
                    result.push(user);
                }
            }
        }
        return result;
    }

    public async SearchForTeam(searchTerm: string) {
        try {
            const searchRegex = new RegExp(searchTerm, 'i');
            return this.Teams.filter(team => searchRegex.test(team.teamName));
        }
        catch (ex) {
            Globals.log(ex);
        }
    }

    public async LookForTeamByRole(roleName: string) {
        for (var team of this.teams) {
            let teamName = RoleHelper.GroomRoleNameAsLowerCase(team.teamName);
            if (teamName == roleName) {
                return team;
            }
        }
        return null;
    }

    public GetTeamsSortedByDivision(): INGSTeam[] {
        return this.teams.sort((t1, t2) => TeamSorter.SortByTeamDivision(t1, t2));
    }

    public GetTeamsSortedByTeamNames(): INGSTeam[] {
        return this.teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName));
    }
}