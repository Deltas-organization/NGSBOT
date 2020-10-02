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
const reactionHelpers_1 = require("../helpers/reactionHelpers");
const translatorBase_1 = require("./translatorBase");
var fs = require('fs');
class ScheduleTranslator extends translatorBase_1.TranslatorBase {
    constructor(client) {
        super(client, "sch");
        this.client = client;
        this._reactionHelpers = new reactionHelpers_1.ReactionHelpers();
    }
    // !Schedule Add practice 7/19/2020 7:00
    Interpret(commands, authorID) {
        if (commands[0].toUpperCase() == "ADD") {
            this.RequestType(authorID);
            //this.parseTime(commands);
        }
    }
    DisplaySchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            var schedule = this.GetScheduleInformation();
            (yield this.getTextChannel()).send(JSON.stringify(schedule));
        });
    }
    RequestType(authorID) {
        return __awaiter(this, void 0, void 0, function* () {
            var textChannel = yield this.getTextChannel();
            var message = yield textChannel.send("Which Type would you like to add?");
            yield this._reactionHelpers.addCustomReactions(message, 'Practice', 'Game');
            var reactionCollection = yield message.awaitReactions((reaction, user) => {
                if (user.id !== authorID)
                    return false;
                let reactionName = reaction.emoji.name;
                if (reactionName == "Practice" || reactionName == "Game") {
                    return true;
                }
                return false;
            }, { max: 1, time: 60000, errors: ['time'] });
            const reaction = reactionCollection.first();
            this.RequestTime(reaction.emoji.name);
        });
    }
    RequestTime(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var textChannel = yield this.getTextChannel();
            var message = yield textChannel.send("What time?");
            yield this._reactionHelpers.addCustomReactions(message, '1_', '2_', '3_', '4_', '5_', '6_', '7_', '8_', '9_', '10', '11', '12');
        });
    }
    parseTime(commands) {
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