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
exports.SearchDBDCommand = void 0;
const discord_js_1 = require("discord.js");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
const SlashCommandBase_1 = require("../Base/SlashCommandBase");
const DBDMongoHelper_1 = require("../../helpers/DBDMongoHelper");
const DescriptionHelper_1 = require("../../DBD/helpers/DescriptionHelper");
class SearchDBDCommand extends SlashCommandBase_1.SlashCommandBase {
    constructor(mongoConnectionUri) {
        super();
        this.longDescriptionOption = {
            name: "long_description",
            description: "Will return a long description",
            type: discord_js_1.ApplicationCommandOptionType.Boolean
        };
        this.searchWordOption = {
            name: "keywords",
            description: "the keywords to search for",
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true
        };
        this.Description = "Will Search DBD database";
        this.Name = "dbdsearch";
        this.GuildLocation = DiscordGuilds_1.DiscordGuilds.DeltasServer;
        this.Ephemeral = false;
        this.mongo = new DBDMongoHelper_1.DBDMongoHelper(mongoConnectionUri);
    }
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name,
            options: this.CreateOptions()
        };
        return this.command;
    }
    CreateOptions() {
        var options = [];
        options.push(this.searchWordOption);
        options.push(this.longDescriptionOption);
        return options;
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const perksFound = yield this.searchPerks(interaction);
            let content = "Nothing Found";
            if (perksFound != null && perksFound.length > 0)
                content = this.createContent(interaction, perksFound[0]);
            yield interaction.editReply({
                content: content
            });
        });
    }
    searchPerks(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchTerm = this.getOptionValue(interaction, this.searchWordOption);
            if (typeof searchTerm != "string") {
                return null;
            }
            searchTerm = searchTerm.toLowerCase();
            const searchRegex = new RegExp(searchTerm, 'g');
            const result = [];
            const perks = yield this.mongo.GetPerks();
            for (let perk of perks) {
                if (perk.keywords.find(k => k.search(searchRegex) != -1))
                    result.push(perk);
            }
            return result;
        });
    }
    createContent(interaction, perk) {
        const descripton = this.getDescription(interaction, perk);
        return `**${perk.name}** \n Page Number: ${perk.pageNumber} \n \n ${descripton}`;
    }
    getDescription(interaction, information) {
        const showLongDescription = this.getOptionValue(interaction, this.longDescriptionOption);
        if (showLongDescription === true)
            return DescriptionHelper_1.DescriptionHelper.GenerateDescription(information.longDescription).join("\n");
        else
            return DescriptionHelper_1.DescriptionHelper.GenerateDescription(information.shortDescription).join("\n");
    }
    getOptionValue(interaction, option) {
        var _a;
        return (_a = interaction.options.data.find(interactedOption => interactedOption.name == option.name)) === null || _a === void 0 ? void 0 : _a.value;
    }
    appendPageSize(survivorPerks) {
        throw new Error("Method not implemented.");
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
exports.SearchDBDCommand = SearchDBDCommand;
//# sourceMappingURL=SearchDBDCommand.js.map