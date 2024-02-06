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
exports.WorkerHelper = void 0;
class WorkerHelper {
    get Guild() {
        return new Promise((Resolver, rejector) => __awaiter(this, void 0, void 0, function* () {
            if (!this._guild)
                this._guild = yield this.GetGuild();
            Resolver(this._guild);
        }));
    }
    constructor(client, _channelId) {
        this.client = client;
        this._channelId = _channelId;
        this._guild = undefined;
    }
    Setup() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    GetGuild() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(this._channelId));
            return channel.guild;
        });
    }
    GetGuildMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            var guild = yield this.Guild;
            if (guild)
                return (yield guild.members.fetch()).map((mem, _, __) => mem);
        });
    }
    AssignRole(guildMember, roleToAssign) {
        return __awaiter(this, void 0, void 0, function* () {
            yield guildMember.roles.add(roleToAssign);
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}
exports.WorkerHelper = WorkerHelper;
//# sourceMappingURL=WorkerHelper.js.map