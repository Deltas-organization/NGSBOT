"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeReminder = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
class PracticeReminder extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBang() {
        return "practice";
    }
    get description() {
        var result = "Will send the message: \n";
        result += "Hey guys, don't forget we have practice ${content}. Lets show up and kick some ass.  \n";
        result += "Where contens is the second parameter supporting double quotes to include spaces, and the third parameter is the channel to notify. \n";
        result += "Requires Admin";
        return result;
    }
    Interpret(commands, detailed, messageSender) {
        if (commands.length != 2) {
            messageSender.SendMessage("Only two parameters are allowed");
            return;
        }
        var time = commands[0];
        var channel = commands[1].slice(2, -1);
        messageSender.SendMessageToChannel(this.ConfigureMessage(time), channel);
    }
    ConfigureMessage(time) {
        return `Hey guys, don't forget we have practice ${time}. Lets show up and kick some ass.`;
    }
}
exports.PracticeReminder = PracticeReminder;
//# sourceMappingURL=practiceReminder.js.map