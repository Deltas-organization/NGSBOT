"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHelper = void 0;
class MessageHelper {
    constructor(JsonPropertyName) {
        this.JsonPropertyName = JsonPropertyName;
        this._lines = [];
        this.Optional = false;
        this.Options = {};
    }
    AddNewLine(message, indentCount = 0) {
        this._lines.push(new DetailedLine(message, indentCount));
    }
    AddJSONLine(message) {
        const lineToAdd = new DetailedLine(message);
        lineToAdd.JsonOnly = true;
        this._lines.push(lineToAdd);
    }
    CreateStringMessage() {
        return this._lines
            .filter(line => !line.JsonOnly)
            .map(line => line.AsString())
            .join("\n");
    }
    CreateJsonMessage() {
        var result = { name: this.JsonPropertyName, information: {} };
        for (var index = 0; index < this._lines.length; index++) {
            result.information[index] = this._lines[index].Message;
        }
        return result;
    }
}
exports.MessageHelper = MessageHelper;
class DetailedLine {
    constructor(Message, indentCount = 0) {
        this.Message = Message;
        this.indentCount = indentCount;
        this._indent = "\u200B ";
        this.JsonOnly = false;
    }
    AsString() {
        return this._indent.repeat(this.indentCount) + this.Message;
    }
}
//# sourceMappingURL=MessageHelper.js.map