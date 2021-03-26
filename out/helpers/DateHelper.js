"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelper = void 0;
class DateHelper {
    static ConvertDateToUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }
}
exports.DateHelper = DateHelper;
//# sourceMappingURL=DateHelper.js.map