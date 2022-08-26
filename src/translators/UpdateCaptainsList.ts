import { Message } from "discord.js";
import { UpdateCaptainsListCommand } from "../commands/UpdateCaptainsListCommand";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { ChannelMessageSender } from "../helpers/messageSenders/ChannelMessageSender";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";

const fs = require('fs');

export class UpdateCaptainsList extends ngsTranslatorBase {
    public get commandBangs(): string[] {
        return ["captain", "captains"];
    }

    public get description(): string {
        return "Will update the captain list";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        var season: number = +LiveDataStore.season;
        const updateCaptainsList = new UpdateCaptainsListCommand(this.translatorDependencies);
        const channelSender = new ChannelMessageSender(this.client, this.messageStore);
        const message = await messageSender.SendMessage("Updating captains list now");
        for (var value in NGSDivisions) {
            const division = NGSDivisions[value];
            try {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, season, division);
            }
            catch {
                await this.AttemptToUpdateCaptainMessage(updateCaptainsList, channelSender, season, division);
            }
        }
        message.Edit("Captains list has been updated");
    }

    private async AttemptToUpdateCaptainMessage(captainsListCommand: UpdateCaptainsListCommand, channelSender: ChannelMessageSender, season: number, division: NGSDivisions) {
        const messageId = await this.GetSavedMessage(season, division);
        const message = await captainsListCommand.CreateDivisionList(division, DiscordChannels.NGSDiscord);
        if (message) {
            if (messageId)
                await channelSender.OverwriteBasicMessage(message, messageId, DiscordChannels.NGSCaptainList);
            else {
                var messages = await channelSender.SendToDiscordChannelAsBasic(message, DiscordChannels.NGSCaptainList);
                await this.CreateMongoRecord(messages, season, division);
            }
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