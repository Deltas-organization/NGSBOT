"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
const Heroes_1 = require("../enums/Heroes");
const Maps_1 = require("../enums/Maps");
class Random {
}
exports.Random = Random;
Random.options = [
    {
        name: 'maps_competitive',
        friendlyName: "competitive maps",
        description: "Returns random maps equal to the value provided. Doesn't include: Mines, Booty Bay, and Aram",
        options: Maps_1.HotsCompetitiveMaps
    },
    {
        name: 'heroes',
        description: "Returns random heroes equal to the value provided.",
        options: Heroes_1.AllHeroes
    },
    {
        name: "assassins",
        description: "Returns random assassins equal to the value provided.",
        options: Heroes_1.Assassin
    },
    {
        name: "melee_assassins",
        friendlyName: "melee assassins",
        description: "Returns random melee assassins equal to the value provided.",
        options: Heroes_1.MeleeAssassin
    },
    {
        name: "ranged_assassins",
        friendlyName: "ranged assassins",
        description: "Returns random ranged assassins equal to the value provided.",
        options: Heroes_1.RangedAssassin
    },
    {
        name: "healers",
        description: "Returns random healers equal to the value provided.",
        options: Heroes_1.Healer
    },
    {
        name: "supports",
        description: "Returns random supports equal to the value provided.",
        options: Heroes_1.Support
    },
    {
        name: "bruisers",
        description: "Returns random bruisers equal to the value provided.",
        options: Heroes_1.Bruiser
    },
    {
        name: "tanks",
        description: "Returns random tanks equal to the value provided.",
        options: Heroes_1.Tank
    },
    {
        name: "maps_all",
        friendlyName: 'all Maps',
        description: "Returns random maps equal to the value provided. Includes: Mines, Booty Bay, and Aram",
        options: [...Maps_1.HotsCompetitiveMaps, "BlackHearts Bay", "Haunted Mines", "ARAM"]
    }
];
//# sourceMappingURL=RandomOptions.js.map