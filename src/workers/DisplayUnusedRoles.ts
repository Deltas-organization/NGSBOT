import { Guild, GuildMember, Role } from "discord.js";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { RoleHelper } from "../helpers/RoleHelper";
import { INGSTeam } from "../interfaces";
import { AssignRolesOptions } from "../message-helpers/AssignRolesOptions";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";
import { WorkerBase } from "./Bases/WorkerBase";

const fs = require('fs');

export class DisplayUnusedRoles extends RoleWorkerBase {

    protected async Start(commands: string[]) {
        await this.BeginAssigning();
    }

    private async BeginAssigning() {
        const teams = await this.dataStore.GetTeams();
        const unusedRoles: string[] = [];
        try {
            let allRoles = (await this.messageSender.originalMessage.guild.roles.fetch()).cache.map((mem, _, __) => mem);
            for (var role of allRoles.sort((r1, r2) => r2.position - r1.position)) {
                if (this.myBotRole.comparePositionTo(role) > 0) {
                    let color = role.hexColor
                    const roleName = this.roleHelper.GroomRoleNameAsLowerCase(role.name);
                    let found = false;
                    for (var team of teams) {
                        let teamName = this.roleHelper.GroomRoleNameAsLowerCase(team.teamName);
                        if (teamName == roleName) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        unusedRoles.push(color + ":" + role.name);
                    }
                }
            }
        }
        catch (e) {
            Globals.log(e);
        }
        this.messageSender.SendMessage("unused Roles:" + unusedRoles.sort((n1, n2) => +n1 - +n2).map(role => role));
    }
}