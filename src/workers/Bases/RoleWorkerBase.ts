import { Guild, Role } from "discord.js";
import { basename } from "path";
import { NGSRoles } from "../../enums/NGSRoles";
import { Globals } from "../../Globals";
import { RespondToMessageSender } from "../../helpers/messageSenders/RespondToMessageSender";
import { Mongohelper } from "../../helpers/Mongohelper";
import { RoleHelper } from "../../helpers/RoleHelper";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { WorkerBase } from "./WorkerBase";

export abstract class RoleWorkerBase extends WorkerBase {

    protected reserveredRoles: Role[] = [];
    protected myBotRole: Role;
    protected captainRole: Role;
    protected stormRole: Role;

    protected roleHelper: RoleHelper;

    public constructor(workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender, private mongoConnection: Mongohelper) {

        super(workerDependencies, detailed, messageSender);
    }

    public async Begin(commands: string[]) {
        await this.Setup();
        await this.Start(commands);
    }

    protected async GetUserRoles() {
        if (this.messageSender.GuildMember)
            return await this.messageSender.GuildMember.roles.cache.map((role, _, __) => role);
    }

    protected async GetGuildRoles() {
        if (this.messageSender.GuildMember)
            return await this.messageSender.GuildMember.guild.roles.cache.map((role, _, __) => role);
    }

    protected async GetGuildMembers() {
        if (this.messageSender.originalMessage.guild)
            return (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
    }

    private async Setup() {
        this.dataStore.Clear();
        if (this.messageSender.originalMessage.guild) {
            this.roleHelper = await RoleHelper.CreateFrom(this.messageSender.originalMessage.guild);
            var captainRole = this.roleHelper.lookForRole(NGSRoles.Captain);
            if (captainRole)
                this.captainRole = captainRole;
            var botRole = this.roleHelper.lookForRole(NGSRoles.NGSBot);
            if (botRole)
                this.myBotRole = botRole;
            var stormRole = this.roleHelper.lookForRole(NGSRoles.Storm);
            if (stormRole)
                this.stormRole = stormRole;

            this.reserveredRoles = await this.GetReservedRoles();
        }
        else {
            console.log("Unable to perform role worker, guild was null")
        }
    }

    private async GetReservedRoles(): Promise<Role[]> {
        const reservedRoles: Role[] = this.roleHelper.GetReservedRoles();
        
        var selfAssignableRoles = await this.mongoConnection.GetAssignedRoleRequests(this.guild.id);
        const allRoles = await this.guild.roles.fetch();
        for (let roleId of selfAssignableRoles) {
            let foundRole = await allRoles.find(item => item.id == roleId);
            if (foundRole) {
                reservedRoles.push(foundRole);
            }
            else {
                Globals.logAdvanced(`didnt find role: ${foundRole}`);
            }
        }

        return reservedRoles;
    }
}