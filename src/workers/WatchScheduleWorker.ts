import { NGSDivisions } from "../enums/NGSDivisions";
import { Mongohelper } from "../helpers/Mongohelper";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { IMongoScheduleRequest } from "../mongo/models/schedule-request";
import { WorkerBase } from "./Bases/WorkerBase";
import { GuildMemberManager, PermissionFlagsBits } from "discord.js";
import { NGSMongoHelper } from "../helpers/NGSMongoHelper";

export class WatchScheduleWorker extends WorkerBase {

    private divisionsToWatch: string[] = [];

    constructor(private mongoHelper: NGSMongoHelper, workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        let unsupportedCommands = this.validateCommands(commands);
        if (unsupportedCommands.length > 0) {
            await this.messageSender.SendMessage(`Some of the requested divisions were not found: \n ${unsupportedCommands.join(',')}`)
        }
        else {
            let createdRecord = await this.createMongoRecord();
            if (this.hasCapabilityToSendMessage() && createdRecord?.divisions) {
                await this.messageSender.SendMessage(`You are now watching divisions: ${createdRecord.divisions.join(',')}`);
            }
            else {
                await this.messageSender.SendBasicMessage("You need to Enable EmbedLinks for me to post the schedule in this channel.");
            }
        }
    }

    private validateCommands(commands: string[]) {
        const unsupportedCommands: string[] = [];
        for (const command of commands) {
            let found = false;
            for (const division of Object.keys(NGSDivisions)) {
                if (command.toLowerCase() == NGSDivisions[division].toLowerCase()) {
                    this.divisionsToWatch.push(division);
                    found = true;
                }
            }
            if (!found) {
                unsupportedCommands.push(command);
            }
        }
        return unsupportedCommands;
    }

    private hasCapabilityToSendMessage(): boolean {
        if (this.messageSender.originalMessage.guild?.members?.me) {
            var me = this.messageSender.originalMessage.guild.members?.me;
            return me.permissionsIn(this.messageSender.Channel.id).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
        }
        return false;
    }

    private async createMongoRecord() {
        const scheduleRequest = {
            channelId: this.messageSender.Channel.id,
            divisions: this.divisionsToWatch,
            requestType: 'divisions'
        } as IMongoScheduleRequest;

        return await this.mongoHelper.AddOrUpdateScheduleRequest(scheduleRequest);
    }
}
