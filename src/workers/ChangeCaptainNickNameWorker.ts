import { GuildMember, User } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { ClientHelper } from "../helpers/ClientHelper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { WorkerBase } from "./Bases/WorkerBase";

export class ChangeCaptainNickNameWorker extends WorkerBase {
    private _users: AugmentedNGSUser[] = [];
    private _guildUsers: GuildMember[];
    private _usersNamesUnableToUpdate: string[] = [];
    private _usersNamesUpdated: string[] = [];
    private _usersNotFound: AugmentedNGSUser[] = [];
    private _usersAlreadyGoodToGo = [];
    private _usersNamesRemovedTitle = [];

    protected async Start(commands: string[]) {
        this._guildUsers = await ClientHelper.GetMembers(this.client, DiscordChannels.NGSDiscord);// (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
        this._users = await this.dataStore.GetUsers();
        await this.ReNameCaptains();
        await this.ReNameAssistantCaptains();
        await this.RemoveNickNames();
        await this.SendMessages();
    }

    private async ReNameCaptains() {
        var captains = this._users.filter(u => u.IsCaptain);
        for (var captain of captains) {
            var discordUser = DiscordFuzzySearch.FindGuildMember(captain, this._guildUsers)?.member;
            if (discordUser) {
                await this.AssignNamePrefix(discordUser, "(C)");
            }
            else {
                this._usersNotFound.push(captain);
            }
        }
    }

    private async ReNameAssistantCaptains() {
        var assistantCaptains = this._users.filter(u => u.IsAssistantCaptain);
        for (var assitantCaptain of assistantCaptains) {
            var discordUser = DiscordFuzzySearch.FindGuildMember(assitantCaptain, this._guildUsers)?.member;
            if (discordUser) {
                await this.AssignNamePrefix(discordUser, "(aC)");
            }
            else {
                this._usersNotFound.push(assitantCaptain);
            }
        }
    }

    private async RemoveNickNames() {
        for (var user of this._guildUsers) {
            try {
                for (var ngsUser of this._users) {
                    var discordUser = DiscordFuzzySearch.FindGuildMember(ngsUser, this._guildUsers)?.member;
                    if (!discordUser)
                        continue;

                    if (discordUser.id == user.id) {
                        if (this.CheckForNameValue(user, "(aC)")) {
                            if (!ngsUser.IsAssistantCaptain)
                                await this.RemoveFromUser(user, "(aC)");
                        }
                        if (this.CheckForNameValue(user, "(C)")) {
                            if (!ngsUser.IsCaptain)
                                await this.RemoveFromUser(user, "(C)");
                        }
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    private async SendMessages() {
        var message = new MessageHelper();
        message.AddNewLine("I was unable to update the following users:");
        message.AddNewLine(this._usersNamesUnableToUpdate.join(", "));
        message.AddEmptyLine();
        message.AddNewLine("I was unable to find the following users:");
        message.AddNewLine(this._usersNotFound.map(u => u.displayName).join(", "));
        message.AddEmptyLine();
        message.AddNewLine("I Added (C) or (AC) to the following users:");
        message.AddNewLine(this._usersNamesUpdated.join(", "));
        message.AddEmptyLine();
        message.AddNewLine("I Removed (C) or (AC) from the following users:");
        message.AddNewLine(this._usersNamesRemovedTitle.join(", "));
        await this.messageSender.SendBasicMessage(message.CreateStringMessage());
    }

    private async AssignNamePrefix(discordUser: GuildMember, prefix: string) {
        if (this.CheckForNameValue(discordUser, prefix) == false) {
            var newName = `${prefix} ${discordUser.displayName}`;
            if (newName.length > 32) {
                this._usersNamesUnableToUpdate.push(discordUser.displayName + " - Name too long \n");
            }
            else {
                try {
                    await discordUser.setNickname(newName, "Changing name to include captain prefix");
                    this._usersNamesUpdated.push(newName);
                }
                catch (e) {
                    this._usersNamesUnableToUpdate.push(discordUser.displayName + ` - ${e} \n`);
                }
            }
        }
        else {
            this._usersAlreadyGoodToGo.push(discordUser.displayName);
        }
    }

    private CheckForNameValue(user: GuildMember, valueToSearch: string): boolean {
        var nameWithNoSpaces = user.nickname?.replace(/\s+/g, '');
        if (nameWithNoSpaces == null)
            nameWithNoSpaces = user.displayName?.replace(/\s+/g, '');

        valueToSearch = valueToSearch
            .replace("(", "\\(")
            .replace(")", "\\)");

        if (nameWithNoSpaces.search(new RegExp(valueToSearch, "i")) != -1)
            return true;
        return false;
    }

    private async RemoveFromUser(user: GuildMember, valueToRemove: string) {
        var nameWithNoSpaces = user.nickname?.replace(/\s+/g, '');
        if (nameWithNoSpaces == null)
            return;

        valueToRemove = valueToRemove
            .replace("(", "\\(")
            .replace(")", "\\)");

        var newName = user.nickname?.replace(new RegExp(valueToRemove, "i"), "");

        try {
            await user.setNickname(newName, "This person is no longer a captain or AC");
            this._usersNamesRemovedTitle.push(user.nickname);
        }
        catch {
            this._usersNamesUnableToUpdate.push(user.displayName);
        }
    }
}