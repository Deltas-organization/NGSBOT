import { NGSDivisions } from "../enums/NGSDivisions";
import { MessageSender } from "../helpers/MessageSender";
import { Mongohelper } from "../helpers/Mongohelper";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { IMongoScheduleRequest } from "../mongo/models/schedule-request";
import { WorkerBase } from "./Bases/WorkerBase";

export class WatchScheduleWorker extends WorkerBase {

    private divisionsToWatch: string[] = [];

    constructor(private mongoHelper: Mongohelper, workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: MessageSender) {
        super(workerDependencies, detailed, messageSender)
    }

    protected async Start(commands: string[]) {
        let unsupportedCommands = this.validateCommands(commands);
        if (unsupportedCommands.length > 0) {
            await this.messageSender.SendMessage(`Some of the requested divisions were not found: \n ${unsupportedCommands.join(',')}`)
        }
        else {
            let createdRecord = await this.createMongoRecord();
            await this.messageSender.SendMessage(`You are now watching divisions: ${createdRecord.divisions.join(',')}`);
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

    private async createMongoRecord() {
        const scheduleRequest = {
            channelId: this.messageSender.TextChannel.id,
            divisions: this.divisionsToWatch,
            requestType: 'divisions'
        } as IMongoScheduleRequest;

        return await this.mongoHelper.addScheduleRequest(scheduleRequest);
    }
}
