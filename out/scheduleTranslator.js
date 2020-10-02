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
exports.ScheduleTranslator = void 0;
var fs = require('fs');
class ScheduleTranslator {
    constructor(client) {
        this.client = client;
    }
    Translate(command) {
        var scheduleRegex = new RegExp('^sch', 'i');
        if (scheduleRegex.test(command)) {
            this.Interpret(command);
        }
    }
    // !Schedule Add practice 7/19/2020 7:00
    Interpret(command) {
        var firstSpace = command.indexOf(' ');
        if (firstSpace == -1) {
            this.DisplaySchedule();
            return;
        }
        var splitCommands = command.split(" ");
        splitCommands = splitCommands.slice(1);
        this.ParseCommands(splitCommands);
    }
    ParseCommands(commands) {
        if (commands[0] == "Add") {
            var scheduleType = commands[1];
            var timeParse = commands[3].split(":");
            var date = new Date(`${commands[2]} ${+timeParse[0] + 1}:${timeParse[1]}:00`);
            var scheduleToAdd = {};
            scheduleToAdd.date = date;
            scheduleToAdd.creator = "Roy";
            scheduleToAdd.type = scheduleType;
            this.AddScheduleDate(scheduleToAdd);
            this.GetScheduleInformation();
        }
    }
    DisplaySchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            var schedule = this.GetScheduleInformation();
            var textChannel = yield this.client.channels.fetch("618209192339046423");
            textChannel.send(JSON.stringify(this.GetScheduleInformation()));
        });
    }
    GetScheduleInformation() {
        let rawdata = fs.readFileSync('C:/Discord/Data/meetings.json');
        return JSON.parse(rawdata);
    }
    AddScheduleDate(schedule) {
        var currentSchedule = this.GetScheduleInformation();
        currentSchedule.push(schedule);
        var stringSchedule = JSON.stringify(currentSchedule);
        fs.writeFileSync('C:/Discord/Data/meetings.json', stringSchedule);
    }
}
exports.ScheduleTranslator = ScheduleTranslator;
//# sourceMappingURL=scheduleTranslator.js.map