"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomSlashWorker = void 0;
const MessageContainer_1 = require("../../message-helpers/MessageContainer");
const RandomOptions_1 = require("../../helpers/RandomOptions");
class RandomSlashWorker {
    Run(respondedOptions) {
        var _a;
        const container = new MessageContainer_1.MessageContainer();
        if ((respondedOptions === null || respondedOptions === void 0 ? void 0 : respondedOptions.length) > 0) {
            for (const data of respondedOptions) {
                var options = this.FindOption(data.name);
                const randomResult = this.GetRandomData(options.options, data.value);
                const group = new MessageContainer_1.MessageGroup();
                group.Add(`Here are your **${(_a = options.friendlyName) !== null && _a !== void 0 ? _a : options.name}**`);
                randomResult.forEach(r => {
                    group.AddOnNewLine(r);
                });
                container.Append(group);
            }
        }
        else {
            container.AddSimpleGroup("Please choose a sub command to randomize, I can't randomize the entierty of hots :)");
        }
        return container;
    }
    ;
    GetRandomData(options, numberOfResults) {
        const result = [];
        for (let i = 0; i < numberOfResults; i++) {
            result.push(this.GetRandom(options));
        }
        return result;
    }
    FindOption(name) {
        for (const option of RandomOptions_1.Random.options) {
            if (option.name == name)
                return option;
        }
        throw "Unable To find option somehow";
    }
    GetRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
exports.RandomSlashWorker = RandomSlashWorker;
//# sourceMappingURL=RandomSlashworker%20copy.js.map