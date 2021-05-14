import { MessageHelper } from "../helpers/MessageHelper";

export class ScheduleContainer {
    private _currentSection: string;
    private _timeAndSchedules = new Map<string, MessageHelper<any>[]>()

    constructor(public dateTitle: string) {

    }

    public AddNewTimeSection(sectionTitle: string) {
        this._currentSection = sectionTitle;
        this._timeAndSchedules.set(sectionTitle, []);
    }

    public AddSchedule(scheduleMessage: MessageHelper<any>) {
        this._timeAndSchedules.get(this._currentSection).push(scheduleMessage);
    }

    public GetAsStringArray(): string[] {
        let result = [];
        let dateTitleString = `${this.dateTitle} \n \n`;
        let message = dateTitleString;
        for (var key of this._timeAndSchedules.keys()) {
            let timeMessage = '';
            timeMessage += key;
            timeMessage += "\n";
            for (var schedule of this._timeAndSchedules.get(key)) {

                timeMessage += schedule.CreateStringMessage();
                timeMessage += "\n";
            }
            timeMessage += "\n";
            if (timeMessage.length + message.length > 2048) {
                result.push(message);
                message = dateTitleString
            }
            message += timeMessage;
        }
        result.push(message);
        return result;
    }
}