import { Globals } from "../../Globals";
import { MessageHelper } from "../../helpers/MessageHelper";
import { MessageSender } from "../../helpers/MessageSender";
import { Mongohelper } from "../../helpers/Mongohelper";
import { RoleHelper } from "../../helpers/RoleHelper";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { IMongoAssignRolesRequest } from "../../mongo/models/role-assign-request";
import { RoleWorkerBase } from "../Bases/RoleWorkerBase";
import { WorkerBase } from "../Bases/WorkerBase";

export class SelfAssignRolesWatcherWorker extends RoleWorkerBase {

    constructor(private mongoHelper: Mongohelper, workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: MessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        try {
            if (this.detailed) {
                await this.DisplayRolesAssignable();
            }
            else {
                const resultMessage = await this.AssignOrUnassignRolesFromUser(commands);
                this.messageSender.SendMessage(resultMessage.CreateStringMessage());
            }
        }
        catch (e) {
            Globals.log("Error", e);
        }
    }

    private async DisplayRolesAssignable() {
        const currentRolesToWatch = await this.mongoHelper.GetAssignedRoleRequests(this.guild.id);
        const allRoles = await this.guild.roles.fetch();
        const roleNames: string[] = [];
        for (var roleNameWatching of currentRolesToWatch) {
            let role = await allRoles.fetch(roleNameWatching);
            if (role)
                roleNames.push(role.name);
        }
        const message = `The roles currently assignable are: ${roleNames.join(', ')}.`;
        this.messageSender.SendBasicMessage(message);
    }

    private async AssignOrUnassignRolesFromUser(commands: string[]) {
        const currentRolesToWatch = await this.mongoHelper.GetAssignedRoleRequests(this.guild.id);
        const allRoles = await this.guild.roles.fetch();
        const assignedRoles: string[] = [];
        const removedRoles: string[] = [];
        var rolesOfMember = this.messageSender.GuildMember.roles.cache.map((role, _, __) => role);
        for (const command of commands) {
            const commandName = command.toLowerCase();
            for (const roleNameWatching of currentRolesToWatch) {
                const role = this.roleHelper.lookForRole(commandName);
                if (role && role.id == roleNameWatching) {
                    if (rolesOfMember.find(r => r == role)) {
                        this.messageSender.GuildMember.roles.remove(role);
                        removedRoles.push(role.name);
                    }
                    else {
                        this.messageSender.GuildMember.roles.add(role);
                        assignedRoles.push(role.name);
                    }
                }
            }
        }
        const messageToSend = new MessageHelper();
        if (assignedRoles.length <= 0 && removedRoles.length <= 0) {
            messageToSend.AddNew("No roles found to assign.");
            return messageToSend;
        }
        if (assignedRoles.length > 0) {
            messageToSend.AddNew(`I have assigned you the following roles: ${assignedRoles.join(", ")}`);
        }
        if (removedRoles.length > 0) {
            messageToSend.AddNewLine(`I have removed the following roles: ${removedRoles.join(", ")}`);
        }
        return messageToSend;
    }
}
