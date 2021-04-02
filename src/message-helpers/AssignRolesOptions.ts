import { Role } from "discord.js";

export class AssignRolesOptions
{
    public AssignedTeamCount: number = 0;
    public AssignedDivCount: number = 0;
    public AssignedCaptainCount: number = 0;
    public PlayersInDiscord: number = 0;
    public HasCaptain: boolean;
    public CreatedTeamRole: boolean;
    public TeamRole: Role;

    constructor(public TeamName: string)
    {

    }

    public get HasValue()
    {
        if (this.AssignedCaptainCount > 0)
            return true;
        if (this.AssignedDivCount > 0)
            return true;
        if (this.AssignedCaptainCount > 0)
            return true;
        return false;
    }
}