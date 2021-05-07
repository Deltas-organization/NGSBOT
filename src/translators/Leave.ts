import { Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam, INGSUser } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { NGSRoles } from "../enums/NGSRoles";
import { RoleHelper } from "../helpers/RoleHelper";


const fs = require('fs');

export class Leave extends ngsTranslatorBase {
    private _reservedRoleNames: string[] = [
        'Caster Hopefuls',
        NGSRoles.FreeAgents,
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'Cupid Captain',
        'Trait Value',
        NGSRoles.Storm,
        '@everyone'];

    private _reserveredRoles: Role[] = [];
    private _myBotRole: Role;
    private _captainRole: Role;
    private _stormRole: Role;

    private _serverRoleHelper: RoleHelper;

    public get commandBangs(): string[] {
        return ["leave"];
    }

    public get description(): string {
        return "Will prompt user for role removals.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        await this.Setup(messageSender);
        
        const message = await this.Begin(messageSender);
        await messageSender.SendMessage(message);
    }

    private async Setup(messageSender: MessageSender) {
        this.dataStore.Clear();
        await this.InitializeRoleHelper(messageSender.originalMessage.guild);
        this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles.Captain);
        this._myBotRole = this._serverRoleHelper.lookForRole(NGSRoles.NGSBot);
        this._stormRole = this._serverRoleHelper.lookForRole(NGSRoles.Storm);
        this._reserveredRoles = this.GetReservedRoles();
    }

    private async InitializeRoleHelper(guild: Guild) {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        this._serverRoleHelper = new RoleHelper(roles);
    }

    private GetReservedRoles(): Role[] {
        const result = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this._serverRoleHelper.lookForRole(roleName);
            if (foundRole) {
                result.push(foundRole);
            }
            else {
                Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }

    private async Begin(messageSender: MessageSender) {
        const rolesOfUser = messageSender.GuildMember.roles.cache.map((role, _, __) => role);
        let foundOneRole = false;
        for (var role of rolesOfUser) {
            if (!this._reserveredRoles.find(serverRole => role == serverRole)) {
                if (this._myBotRole.comparePositionTo(role) > 0) {
                    foundOneRole = true;
                    await this.AskRoleRemoval(messageSender, role);
                }
            }
        }

        if (!foundOneRole)
            return "No roles found to remove.";
        else
            return "Thats all the roles I found!";
    }

    private async AskRoleRemoval(messageSender: MessageSender, role: Role) {
        const messageResult = await messageSender.SendReactionMessage(
            `would you like me to remove Role: ${role.name}`,
            (member) => member == messageSender.GuildMember,
            () => this.RemoveRole(messageSender.GuildMember, role));

        messageResult.message.delete();
    }

    private async RemoveRole(guildMember: GuildMember, role: Role) {
        await guildMember.roles.remove(role);
    }
}