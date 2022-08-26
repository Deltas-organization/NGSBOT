import { Mongohelper } from "../../helpers/Mongohelper";
import { RespondToMessageSender } from "../../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { IMongoAssignRolesRequest } from "../../mongo/models/role-assign-request";
import { WorkerBase } from "../Bases/WorkerBase";

export class SelfAssignRolesRemoverWorker extends WorkerBase {

    constructor(private mongoHelper: Mongohelper, workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        try {
            const assignableRoles = await this.GetAssignablesRoles(commands);
            if (assignableRoles == null)
                return;
            await this.RemoveRoles(assignableRoles);
            this.messageSender.SendBasicMessage("I have removed the roles from the list.")

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

    private async RemoveRoles(rolesToWatch: string[]) {
        const assignRolesRequest = {
            guildId: this.guild.id,
            assignablesRoles: rolesToWatch
        } as IMongoAssignRolesRequest;

        return await this.mongoHelper.RemoveAssignedRoles(assignRolesRequest);
    }
}
