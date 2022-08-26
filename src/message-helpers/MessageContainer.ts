export class MessageContainer {
    private _groups: MessageGroup[] = [];

    public get SingleMessage() {
        return this._groups.map(g => g.AsString()).join('\n\n');
    }

    public MultiMessages(lengthRequirement: number): string[] {
        let result: string[] = [];
        let currentMessage: string = "";
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

    public AddSimpleGroup(message: string) {
        const group = new MessageGroup();
        group.Add(message);
        this.Append(group);
    }

    public Append(group: MessageGroup | MessageGroup[]) {
        if (Array.isArray(group))
            this._groups.push(...group);
        else
            this._groups.push(group);
    }
}

export class MessageGroup {
    private _lines: DetailedLine[] = [];

    public get Length() {
        return this.AsString().length;
    }

    public Prepend(message: string) {
        let line = new DetailedLine(message, 0);
        const shiftedMessage = this._lines.shift();
        if (shiftedMessage)
            line.Message += shiftedMessage.Message;

        this._lines.unshift(line);
    }

    public Add(message: string) {
        let line = new DetailedLine("", 0);
        const poppedMessage = this._lines.pop();
        if (poppedMessage)
            line = poppedMessage;

        line.Message += message;
        this._lines.push(line);
    }

    public AddOnNewLine(message: string, indentCount: number = 0) {
        this._lines.push(new DetailedLine(message, indentCount));
    }

    public AddEmptyLine() {
        this.AddOnNewLine('');
    }

    public Combine(group: MessageGroup) {
        this._lines = this._lines.concat(group._lines);
    }

    public AsString() {
        return this._lines.map(s => s.AsString()).join("\n");
    }
}

class DetailedLine {
    private readonly _indent = "\u200B ";

    public newMessageLine: boolean = false;

    constructor(public Message: string, private indentCount: number = 0) { }

    public AsString() {
        return this._indent.repeat(this.indentCount) + this.Message;
    }
}
