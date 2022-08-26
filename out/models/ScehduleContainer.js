"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleContainer = void 0;
class ScheduleContainer {
    constructor(dateTitle) {
        this.dateTitle = dateTitle;
        this._timeAndSchedules = new Map();
    }
    AddNewTimeSection(sectionTitle) {
        this._currentSection = sectionTitle;
        this._timeAndSchedules.set(sectionTitle, []);
    }
    AddSchedule(scheduleMessage) {
        const section = this._timeAndSchedules.get(this._currentSection);
        if (section)
            section.push(scheduleMessage);
    }
    GetAsStringArray() {
        let result = [];
        let dateTitleString = `${this.dateTitle} \n \n`;
        let message = dateTitleString;
        for (var key of this._timeAndSchedules.keys()) {
            let timeMessage = '';
            timeMessage += key;
            timeMessage += "\n";
            const section = this._timeAndSchedules.get(key);
            if (!section)
                break;
            for (var schedule of section) {
                timeMessage += schedule.CreateStringMessage();
                timeMessage += "\n";
            }
            timeMessage += "\n";
            if (timeMessage.length + message.length > 2048) {
                result.push(message);
                message = dateTitleString;
            }
            message += timeMessage;
        }
        result.push(message);
        return result;
    }
}
exports.ScheduleContainer = ScheduleContainer;
//# sourceMappingURL=ScehduleContainer.js.map