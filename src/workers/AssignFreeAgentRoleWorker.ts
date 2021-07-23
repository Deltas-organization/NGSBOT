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

export class AssignFreeAgentRoleWorker extends RoleWorkerBase {

    protected async Start(commands: string[]) {
        await this.BeginWorker();
    }

    private async BeginWorker() {
        let message = "Unable To Assign Free Agent Role";
        try {
            const guildMember = (await this.messageSender.GuildMember);
            let freeAgentRole = this.roleHelper.lookForRole(NGSRoles.FreeAgents);
            var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            if (freeAgentRole != null) {
                if (!this.HasRole(rolesOfUser, freeAgentRole)) {
                    await this.AssignRole(guildMember, freeAgentRole);
                    message = "Assigned Free Agent Role";
                }
                else {
                    await this.RemoveRole(guildMember, freeAgentRole);
                    message = "Removed Free Agent Role";
                }
            }
        }
        catch (e) {
            Globals.log(e);
        }

        await this.messageSender.SendMessage(message);
    }

    private async AssignRole(guildMember: GuildMember, divRole: Role) {
        await guildMember.roles.add(divRole);
    }

    private async RemoveRole(guildMember: GuildMember, role: Role) {
        await guildMember.roles.remove(role);
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}