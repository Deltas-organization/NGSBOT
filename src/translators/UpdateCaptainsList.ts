import { Guild, GuildMember, Role } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { MessageHelper } from "../helpers/MessageHelper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { NGSRoles } from "../enums/NGSRoles";
import { RoleHelper } from "../helpers/RoleHelper";
import { AssignRolesOptions } from "../message-helpers/AssignRolesOptions";
import { AssignRolesWorker } from "../workers/AssignRolesWorker";
import { UpdateCaptainsListCommand } from "../commands/UpdateCaptainsListCommand";
import { NGSDivisions } from "../enums/NGSDivisions";
import { MessageDictionary } from "../helpers/MessageDictionary";
import { DiscordChannels } from "../enums/DiscordChannels";
import { SendChannelMessage } from "../helpers/SendChannelMessage";

const fs = require('fs');

export class UpdateCaptainsList extends ngsTranslatorBase
{
    public get commandBangs(): string[]
    {
        return ["captain", "captains"];
    }

    public get description(): string
    {
        return "Will update the captain list";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        const updateCaptainsList = new UpdateCaptainsListCommand(this.translatorDependencies);
        const channelSender = new SendChannelMessage(this.client, this.messageStore);
        for (var value in NGSDivisions)
        {
            const division = NGSDivisions[value];
            try
            {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, division);
            }
            catch {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, division)
            }
        }
    }
    private async AttemptToUpdateCaptainMessage(captainsListCommand: UpdateCaptainsListCommand, channelSender: SendChannelMessage, division: NGSDivisions)
    {
        const messageId = MessageDictionary.GetSavedMessage(division);
        const message = await captainsListCommand.CreateDivisionList(division, DiscordChannels.NGSDiscord);
        if (messageId)
            await channelSender.OverwriteMessage(message, messageId, DiscordChannels.NGSCaptainList, true);
        else
            await channelSender.SendMessageToChannel(message, DiscordChannels.NGSCaptainList, true);
    }
}