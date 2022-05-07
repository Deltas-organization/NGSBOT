"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageGroup = exports.MessageContainer = void 0;
class MessageContainer {
    constructor() {
        this._groups = [];
    }
    get SingleMessage() {
        return this._groups.map(g => g.AsString()).join('\n\n');
    }
    MultiMessages(lengthRequirement) {
        let result = [];
        let currentMessage = "";
        for (var group of this._groups) {
            if (currentMessage.length + group.Length + 4 > lengthRequirement) {
                result.push(currentMessage);
                currentMessage = "";
            }
            currentMessage += group.AsString() + "\n\n";
        }
        result.push(currentMessage);
        return result;
    }
    AddSimpleGroup(message) {
        const group = new MessageGroup();
        group.Add(message);
        this.Append(group);
    }
    Append(group) {
        if (Array.isArray(group))
            this._groups.push(...group);
        else
            this._groups.push(group);
    }
}
exports.MessageContainer = MessageContainer;
class MessageGroup {
    constructor() {
        this._lines = [];
    }
    get Length() {
        return this.AsString().length;
    }
    Add(message) {
        let line = new DetailedLine("", 0);
        if (this._lines.length > 0)
            line = this._lines.pop();
        line.Message += message;
        this._lines.push(line);
    }
    AddOnNewLine(message, indentCount = 0) {
        this._lines.push(new DetailedLine(message, indentCount));
    }
    AddEmptyLine() {
        this.AddOnNewLine('');
    }
    Combine(group) {
        this._lines = this._lines.concat(group._lines);
    }
    AsString() {
        return this._lines.map(s => s.AsString()).join("\n");
    }
}
exports.MessageGroup = MessageGroup;
class DetailedLine {
    constructor(Message, indentCount = 0) {
        this.Message = Message;
        this.indentCount = indentCount;
        this._indent = "\u200B ";
        this.newMessageLine = false;
    }
    AsString() {
        return this._indent.repeat(this.indentCount) + this.Message;
    }
}
//# sourceMappingURL=MessageContainer.js.map