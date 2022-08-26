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
        const section = this._timeAndSchedules.get(this._currentSection);
        if (section)
            section.push(scheduleMessage);
    }

    public GetAsStringArray(): string[] {
        let result: string[] = [];
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
                message = dateTitleString
            }
            message += timeMessage;
        }
        result.push(message);
        return result;
    }
}