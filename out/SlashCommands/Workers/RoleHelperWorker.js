"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleHelperWorker = void 0;
const Mongohelper_1 = require("../../helpers/Mongohelper");
class RoleHelperWorker {
    constructor(dataStore, mongoConnectionUri, guild) {
        this.dataStore = dataStore;
        this.guild = guild;
        this.mongoHelper = new Mongohelper_1.Mongohelper(mongoConnectionUri);
    }
    CreateRole(roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.guild.roles.create({
                name: roleName,
                mentionable: true,
                hoist: true,
                reason: 'needed a new team role added'
            });
        });
    }
}
exports.RoleHelperWorker = RoleHelperWorker;
//# sourceMappingURL=RoleHelperWorker.js.map