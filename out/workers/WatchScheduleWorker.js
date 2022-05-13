"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchScheduleWorker = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
const WorkerBase_1 = require("./Bases/WorkerBase");
class WatchScheduleWorker extends WorkerBase_1.WorkerBase {
    constructor(mongoHelper, workerDependencies, detailed, messageSender) {
        super(workerDependencies, detailed, messageSender);
        this.mongoHelper = mongoHelper;
        this.detailed = detailed;
        this.messageSender = messageSender;
        this.divisionsToWatch = [];
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            let unsupportedCommands = this.validateCommands(commands);
            if (unsupportedCommands.length > 0) {
                yield this.messageSender.SendMessage(`Some of the requested divisions were not found: \n ${unsupportedCommands.join(',')}`);
            }
            else {
                let createdRecord = yield this.createMongoRecord();
                if (this.hasCapabilityToSendMessage()) {
                    yield this.messageSender.SendMessage(`You are now watching divisions: ${createdRecord.divisions.join(',')}`);
                }
                else {
                    yield this.messageSender.SendBasicMessage("You need to Enable EmbedLinks for me to post the schedule in this channel.");
                }
            }
        });
    }
    validateCommands(commands) {
        const unsupportedCommands = [];
        for (const command of commands) {
            let found = false;
            for (const division of Object.keys(NGSDivisions_1.NGSDivisions)) {
                if (command.toLowerCase() == NGSDivisions_1.NGSDivisions[division].toLowerCase()) {
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
    hasCapabilityToSendMessage() {
        return this.messageSender.originalMessage.guild.me.permissionsIn(this.messageSender.Channel.id).has(['SEND_MESSAGES', 'EMBED_LINKS']);
    }
    createMongoRecord() {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduleRequest = {
                channelId: this.messageSender.Channel.id,
                divisions: this.divisionsToWatch,
                requestType: 'divisions'
            };
            return yield this.mongoHelper.AddOrUpdateScheduleRequest(scheduleRequest);
        });
    }
}
exports.WatchScheduleWorker = WatchScheduleWorker;
//# sourceMappingURL=WatchScheduleWorker.js.map