import { Guild, GuildMember, Message, Role } from "discord.js";
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
import { Mongohelper } from "../helpers/Mongohelper";

const fs = require('fs');

export class UpdateCaptainsList extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["captain", "captains"];
    }

    public get description(): string {
        return "Will update the captain list";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const updateCaptainsList = new UpdateCaptainsListCommand(this.translatorDependencies);
        const channelSender = new SendChannelMessage(this.client, this.messageStore);
        const message = await messageSender.SendMessage("Updating captains list now");
        for (var value in NGSDivisions) {
            const division = NGSDivisions[value];
            try {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, 13, division);
            }
            catch {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, 13, division);
            }
        }
        message.Edit("Captains list has been updated");
    }

    private async AttemptToUpdateCaptainMessage(captainsListCommand: UpdateCaptainsListCommand, channelSender: SendChannelMessage, season: number, division: NGSDivisions) {
        const messageId = await this.GetSavedMessage(season, division);
        const message = await captainsListCommand.CreateDivisionList(division, DiscordChannels.NGSDiscord);
        if (messageId)
            await channelSender.OverwriteMessage(message, messageId, DiscordChannels.NGSCaptainList, true);
        else {
            var messages = await channelSender.SendMessageToChannel(message, DiscordChannels.NGSCaptainList, true);
            await this.CreateMongoRecord(messages, season, division);
        }
    }

    private async GetSavedMessage(season: number, division: NGSDivisions) {
        var mongoHelper = this.CreateMongoHelper();
        return mongoHelper.GetCaptainListMessageId(season, division);
    }

    private async CreateMongoRecord(messages: Message[], season: number, division: NGSDivisions) {
        if (messages.length > 1) {
            Globals.log("There is more then one captain message for a division help...");
            return;
        }
        var mongoHelper = this.CreateMongoHelper();
        return await mongoHelper.CreateCaptainListRecord(messages[0].id, season, division);

    }
}