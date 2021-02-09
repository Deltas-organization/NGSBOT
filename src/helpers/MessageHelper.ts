import { TeamNameChecker } from "../translators/TeamChecker";

export class MessageHelper<T> {
    private _lines: DetailedLine[] = [];

    public Options: T = {} as T;

    public constructor(private JsonPropertyName: string) {
    }

    public AddNewLine(message: string, indentCount: number = 0) {
        this._lines.push(new DetailedLine(message, indentCount));
    }

    public AddJSONLine(message: string) {
        const lineToAdd = new DetailedLine(message);
        lineToAdd.JsonOnly = true;
        this._lines.push(lineToAdd);
    }

    public CreateStringMessage(): string {
        return this._lines
            .filter(line => !line.JsonOnly)
            .map(line => line.AsString())
            .join("\n");
    }

    public CreateJsonMessage(): any {
        var result: any = { name: this.JsonPropertyName, information: {} };
        for (var option in this.Options) {
            const value = this.Options[option];
            let name: string = option;
            if (name == "name")
                name = "optionName";

            if (name == "information")
                name = "optionInformation";

            result[name] = value;
        }
        for (var index = 0; index < this._lines.length; index++) {
            result.information[index] = this._lines[index].Message;
        }
        return result;
    }
}

class DetailedLine {
    private readonly _indent = "\u200B ";
    public JsonOnly: boolean = false;

    constructor(public Message: string, private indentCount: number = 0) { }

    public AsString() {
        return this._indent.repeat(this.indentCount) + this.Message;
    }
}