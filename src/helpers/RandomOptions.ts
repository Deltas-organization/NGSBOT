import { AllHeroes, Assassin, Bruiser, Healer, MeleeAssassin, RangedAssassin, Support, Tank } from "../enums/Heroes";
import { HotsCompetitiveMaps } from "../enums/Maps";

export class Random {
    public static readonly options: { name: string, description: string, friendlyName?: string, options: string[] }[] =
    [
        {
            name: 'maps_competitive',
            friendlyName: "competitive maps",
            description: "Returns random maps equal to the value provided. Doesn't include: Mines, Booty Bay, and Aram",
            options: HotsCompetitiveMaps
        },
        {
            name: 'heroes',
            description: "Returns random heroes equal to the value provided.",
            options: AllHeroes
        },
        {
            name: "assassins",
            description: "Returns random assassins equal to the value provided.",
            options: Assassin
        },
        {
            name: "melee_assassins",
            friendlyName: "melee assassins",
            description: "Returns random melee assassins equal to the value provided.",
            options: MeleeAssassin
        },
        {
            name: "ranged_assassins",
            friendlyName: "ranged assassins",
            description: "Returns random ranged assassins equal to the value provided.",
            options: RangedAssassin
        },
        {
            name: "healers",
            description: "Returns random healers equal to the value provided.",
            options: Healer
        },
        {
            name: "supports",
            description: "Returns random supports equal to the value provided.",
            options: Support
        },
        {
            name: "bruisers",
            description: "Returns random bruisers equal to the value provided.",
            options: Bruiser
        },
        {
            name: "tanks",
            description: "Returns random tanks equal to the value provided.",
            options: Tank
        },
        {
            name: "maps_all",
            friendlyName: 'all Maps',
            description: "Returns random maps equal to the value provided. Includes: Mines, Booty Bay, and Aram",
            options: [...HotsCompetitiveMaps, "BlackHearts Bay", "Haunted Mines", "ARAM"]
        }
    ];
}