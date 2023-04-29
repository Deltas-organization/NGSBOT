import { DBDPerk, DescriptionType } from "../DBD/types";
import { Mongohelper } from "./Mongohelper";

export class DBDMongoHelper extends Mongohelper {

    constructor(connectionUri: string) {
        super(connectionUri, "DBD");
    }

    public async GetPerks(): Promise<DBDPerk[]> {
        await this.connectedPromise;
        const perks = [this.aceInThehole];// await this.GetAllFromCollection<DBDPerk>("perks");
        let survivorPerks = perks.filter(p => p.perkType == "survivor");
        let killerPerks = perks.filter(p => p.perkType == "killer");
        survivorPerks = survivorPerks.sort(this.sortAlphabetically);
        killerPerks = killerPerks.sort(this.sortAlphabetically);
        this.appendPageNumber(survivorPerks);
        this.appendPageNumber(killerPerks);

        return [...survivorPerks, ...killerPerks];
    }

    private appendPageNumber(survivorPerks: DBDPerk[]) {
        let pageSize = 10;
        for (let i = 0, pageNumber = 1; i < survivorPerks.length; i++) {
            if (i % pageSize)
                pageNumber++;

            let perk = survivorPerks[i];
            perk.pageNumber = pageNumber;
        }
    }

    private sortAlphabetically(perk1: DBDPerk, perk2: DBDPerk) {
        if (perk1.name < perk2.name) {
            return -1;
        }
        if (perk1.name > perk1.name) {
            return 1;
        }
        return 0;
    }


    private aceInThehole: DBDPerk = {
        name: "Ace in the hole",
        keywords: ["ace", "hole"],
        characterName: "Ace Visconti",
        perkType: "survivor",
        longDescription: [{
            value: "Lady Luck always seems to be throwing something good your way.",
            type: DescriptionType.normal
        }, {
            value: 'When retrieving an Item from a Chest, there is a chance an Add-on will be attached to it.',
            type: DescriptionType.normal
        }, {
            value: [{
                value: "100% chance for an Add-on of Very Rare Rarity or lower",
                type: DescriptionType.normal
            },
            {
                value: "10/25/50% change for a second Add-on of Uncommon Rarity or lower",
                type: DescriptionType.normal
            }],
            type: DescriptionType.list
        }, {
            value: "Ace in the Hole allows you to keep any Add-ons your Item has equipped upon escaping.",
            type: DescriptionType.normal
        }, {
            value: `Everything that glitters isn't gold. But gold isn't worth a damn in this place, so this should come in handy." — Ace Visconti`,
            type: DescriptionType.normal
        }],
        shortDescription: [{
            value: "When opening a chest you will get an item with a very rare or lower Add-on and a 50% chance to get a second add-on of uncommon or lower.",
            type: DescriptionType.normal
        }]
    }
}