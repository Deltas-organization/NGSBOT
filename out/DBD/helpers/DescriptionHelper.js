"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptionHelper = void 0;
const types_1 = require("../types");
class DescriptionHelper {
    static GenerateDescription(descriptions) {
        let result = [];
        for (const description of descriptions) {
            switch (description.type) {
                case types_1.DescriptionType.header: {
                    result.push(`**${description.value}**`);
                    break;
                }
                case types_1.DescriptionType.normal: {
                    result.push(`${description.value}`);
                    break;
                }
                case types_1.DescriptionType.list: {
                    var listItems = this.GenerateDescription(description.value);
                    let count = 1;
                    for (var item of listItems) {
                        result.push(`  ${count}. ${item}`);
                        count++;
                    }
                    break;
                }
            }
        }
        return result;
    }
}
exports.DescriptionHelper = DescriptionHelper;
//# sourceMappingURL=DescriptionHelper.js.map