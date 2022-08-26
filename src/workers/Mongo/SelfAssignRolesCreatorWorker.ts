import { Mongohelper } from "../../helpers/Mongohelper";
import { RespondToMessageSender } from "../../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { IMongoAssignRolesRequest } from "../../mongo/models/role-assign-request";
import { WorkerBase } from "../Bases/WorkerBase";

export class SelfAssignRolesCreatorWorker extends WorkerBase {

    constructor(private mongoHelper: Mongohelper, workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        try {
            if (this.detailed) {
                const currentRolesToWatch = await this.mongoHelper.GetAssignedRoleRequests(this.guild.id);
                const allRoles = await this.guild.roles.fetch();
                const roleNames: string[] = [];
                for (var roleNameWatching of currentRolesToWatch) {
                    let role = await allRoles.find(a => a.id == roleNameWatching);
                    if (role)
                        roleNames.push(role.name);
                }
                const message = `The roles currently assignable are: ${roleNames.join(', ')}.`;
                this.messageSender.SendBasicMessage(message);
            }
            else {
                const assignableRoles = await this.GetAssignablesRoles(commands);
                if (assignableRoles == null)
                    return;
                await this.UpsertRecords(assignableRoles);
                this.messageSender.SendBasicMessage("I have added the role to the list.")
            }
        }
        catch (e) {

        }
    }

    private async GetAssignablesRoles(commands: string[]) {
        const allRoles = await this.guild.roles.fetch();
        const rolesToWatch: string[] = [];
        let allRolesValid = true;
        for (const command of commands) {
            if (command.startsWith('<@&') && command.endsWith('>')) {
                const commandName = command.slice(3, -1);
                const existingRole = await allRoles.find(r => r.id == commandName);
                if (existingRole) {
                    rolesToWatch.push(commandName);
                }
                else {
                    allRolesValid = false;
                }
            }
            else {
                allRolesValid = false;
            }
        }
        if (!allRolesValid) {
            await this.messageSender.SendBasicMessage("Unable to find all valid roles, Aborting...");
            return null;
        }
        return rolesToWatch;
    }

    private async UpsertRecords(rolesToWatch: string[]) {
        const assignRolesRequest = {
            guildId: this.guild.id,
            assignablesRoles: rolesToWatch
        } as IMongoAssignRolesRequest;

        return await this.mongoHelper.AddOrUpdateAssignRoleRequest(assignRolesRequest);
    }
}
