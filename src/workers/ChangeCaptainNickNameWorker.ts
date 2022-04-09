import { GuildMember, User } from "discord.js";
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

    protected async Start(commands: string[]) {
        this._guildUsers = (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
        this._users = await this.dataStore.GetUsers();
        await this.ReNameCaptains();
        await this.ReNameAssistantCaptains();
        await this.SendMessages();
    }

    private async ReNameCaptains() {
        var captains = this._users.filter(u => u.IsCaptain);
        for (var captain of captains) {
            var discordUser = DiscordFuzzySearch.FindGuildMember(captain, this._guildUsers)?.member;
            if (discordUser) {
                if (this.CheckForNameValue(discordUser, "(C)") == false) {
                    var newName = `(C) ${discordUser.displayName}`;
                    if (newName.length > 32) {
                        this._usersNamesUnableToUpdate.push(discordUser.displayName);
                    }
                    else {
                        try {
                            await discordUser.setNickname(newName, "Changing name to include captain prefix");
                            this._usersNamesUpdated.push(newName);
                        }
                        catch {
                            this._usersNamesUnableToUpdate.push(discordUser.displayName);
                        }
                    }
                }
                else {
                    this._usersAlreadyGoodToGo.push(discordUser.displayName);
                }
            }
            else {
                this._usersNotFound.push(captain);
            }
        }
    }

    private async ReNameAssistantCaptains() {
        var assitantCaptains = this._users.filter(u => u.IsAssistantCaptain);
        for (var assitantCaptain of assitantCaptains) {
            var discordUser = DiscordFuzzySearch.FindGuildMember(assitantCaptain, this._guildUsers)?.member;
            if (discordUser) {
                if (this.CheckForNameValue(discordUser, "(aC)") == false) {
                    var newName = `(aC) ${discordUser.displayName}`;
                    if (newName.length > 32) {
                        this._usersNamesUnableToUpdate.push(discordUser.displayName);
                    }
                    else {
                        try {
                            await discordUser.setNickname(newName, "Changing name to include assitant captain prefix");
                            this._usersNamesUpdated.push(newName);
                        }
                        catch {
                            this._usersNamesUnableToUpdate.push(discordUser.displayName);
                        }
                    }
                }
                else {
                    this._usersAlreadyGoodToGo.push(discordUser.displayName);
                }
            }
            else {
                this._usersNotFound.push(assitantCaptain);
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
        message.AddNewLine("I update the following users:");
        message.AddNewLine(this._usersNamesUpdated.join(", "));
        await this.messageSender.SendBasicMessage(message.CreateStringMessage());
    }

    private CheckForNameValue(user: GuildMember, valueToSearch: string): boolean {
        var nameWithNoSpaces = user.nickname?.replace(/\s+/g, '');
        if (nameWithNoSpaces == null)
            nameWithNoSpaces = user.displayName?.replace(/\s+/g, '');
        if (nameWithNoSpaces.search(new RegExp(valueToSearch, "i")) != -1)
            return true;
        return false;
    }
}