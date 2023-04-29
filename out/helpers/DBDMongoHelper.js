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
exports.DBDMongoHelper = void 0;
const types_1 = require("../DBD/types");
const Mongohelper_1 = require("./Mongohelper");
class DBDMongoHelper extends Mongohelper_1.Mongohelper {
    constructor(connectionUri) {
        super(connectionUri, "DBD");
        this.aceInThehole = {
            name: "Ace in the hole",
            keywords: ["ace", "hole"],
            characterName: "Ace Visconti",
            perkType: "survivor",
            longDescription: [{
                    value: "Lady Luck always seems to be throwing something good your way.",
                    type: types_1.DescriptionType.normal
                }, {
                    value: 'When retrieving an Item from a Chest, there is a chance an Add-on will be attached to it.',
                    type: types_1.DescriptionType.normal
                }, {
                    value: [{
                            value: "100% chance for an Add-on of Very Rare Rarity or lower",
                            type: types_1.DescriptionType.normal
                        },
                        {
                            value: "10/25/50% change for a second Add-on of Uncommon Rarity or lower",
                            type: types_1.DescriptionType.normal
                        }],
                    type: types_1.DescriptionType.list
                }, {
                    value: "Ace in the Hole allows you to keep any Add-ons your Item has equipped upon escaping.",
                    type: types_1.DescriptionType.normal
                }, {
                    value: `Everything that glitters isn't gold. But gold isn't worth a damn in this place, so this should come in handy." — Ace Visconti`,
                    type: types_1.DescriptionType.normal
                }],
            shortDescription: [{
                    value: "When opening a chest you will get an item with a very rare or lower Add-on and a 50% chance to get a second add-on of uncommon or lower.",
                    type: types_1.DescriptionType.normal
                }]
        };
    }
    GetPerks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectedPromise;
            const perks = [this.aceInThehole]; // await this.GetAllFromCollection<DBDPerk>("perks");
            let survivorPerks = perks.filter(p => p.perkType == "survivor");
            let killerPerks = perks.filter(p => p.perkType == "killer");
            survivorPerks = survivorPerks.sort(this.sortAlphabetically);
            killerPerks = killerPerks.sort(this.sortAlphabetically);
            this.appendPageNumber(survivorPerks);
            this.appendPageNumber(killerPerks);
            return [...survivorPerks, ...killerPerks];
        });
    }
    appendPageNumber(survivorPerks) {
        let pageSize = 10;
        for (let i = 0, pageNumber = 1; i < survivorPerks.length; i++) {
            if (i % pageSize)
                pageNumber++;
            let perk = survivorPerks[i];
            perk.pageNumber = pageNumber;
        }
    }
    sortAlphabetically(perk1, perk2) {
        if (perk1.name < perk2.name) {
            return -1;
        }
        if (perk1.name > perk1.name) {
            return 1;
        }
        return 0;
    }
}
exports.DBDMongoHelper = DBDMongoHelper;
//# sourceMappingURL=DBDMongoHelper.js.map