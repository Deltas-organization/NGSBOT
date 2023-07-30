"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelHelper = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const NGSDivisions_1 = require("../enums/NGSDivisions");
class ChannelHelper {
    static GetDiscordChannelForDivision(division) {
        switch (division) {
            case NGSDivisions_1.NGSDivisions.Heroic:
                return DiscordChannels_1.DiscordChannels.DivisionHeroic;
            case NGSDivisions_1.NGSDivisions.Nexus:
                return DiscordChannels_1.DiscordChannels.DivisionNexus;
            case NGSDivisions_1.NGSDivisions.A:
                return DiscordChannels_1.DiscordChannels.DivisionA;
            case NGSDivisions_1.NGSDivisions.BEast:
            case NGSDivisions_1.NGSDivisions.BWest:
                return DiscordChannels_1.DiscordChannels.DivisionB;
            case NGSDivisions_1.NGSDivisions.CEast:
            case NGSDivisions_1.NGSDivisions.CWest:
                return DiscordChannels_1.DiscordChannels.DivisionC;
            case NGSDivisions_1.NGSDivisions.DEast:
            case NGSDivisions_1.NGSDivisions.DWest:
                return DiscordChannels_1.DiscordChannels.DivisionD;
            case NGSDivisions_1.NGSDivisions.E:
                return DiscordChannels_1.DiscordChannels.DivisionE;
            default:
                return null;
        }
    }
}
exports.ChannelHelper = ChannelHelper;
//# sourceMappingURL=ChannelHelper.js.map