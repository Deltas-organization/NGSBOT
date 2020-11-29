"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Globals = void 0;
let Globals = /** @class */ (() => {
    class Globals {
        static log(message, ...optionalParams) {
            if (Globals.EnableLogging) {
                if (optionalParams && optionalParams.length > 0)
                    console.log(message, optionalParams);
                else
                    console.log(message);
            }
        }
        static logAdvanced(message, ...optionalParams) {
            if (Globals.EnableAdvancedLogging) {
                if (optionalParams)
                    console.log(message, optionalParams);
                else
                    console.log(message);
            }
        }
    }
    Globals.EnableLogging = true;
    Globals.EnableAdvancedLogging = false;
    return Globals;
})();
exports.Globals = Globals;
//# sourceMappingURL=globals.js.map