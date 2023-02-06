"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslatorService = void 0;
const AssignRoles_1 = require("../AssignRoles");
const Cleanup_1 = require("../Cleanup");
const CoinFlip_1 = require("../CoinFlip");
const commandLister_1 = require("../commandLister");
const ConfigSetter_1 = require("../ConfigSetter");
const GamesCommand_1 = require("../GamesCommand");
const Leave_1 = require("../Leave");
const SelfAssignRolesCreator_1 = require("../mongo/SelfAssignRolesCreator");
const SelfAssignRolesRemover_1 = require("../mongo/SelfAssignRolesRemover");
const SelfAssignRolesWatcher_1 = require("../mongo/SelfAssignRolesWatcher");
const NonCastedGamesCommand_1 = require("../NonCastedGamesCommand");
const Purge_1 = require("../Purge");
const Random_1 = require("../Random");
const RegisteredCount_1 = require("../RegisteredCount");
const Reload_1 = require("../Reload");
const ScheduleLister_1 = require("../ScheduleLister");
const SearchPlayers_1 = require("../SearchPlayers");
const SeasonInformation_1 = require("../SeasonInformation");
const TeamChecker_1 = require("../TeamChecker");
const TestTranslator_1 = require("../TestTranslator");
const UnusedRoles_1 = require("../UnusedRoles");
const UpdateCaptainsList_1 = require("../UpdateCaptainsList");
const WatchSchedule_1 = require("../WatchSchedule");
class TranslatorService {
    constructor(botCommand, dependencies) {
        this.botCommand = botCommand;
        this.dependencies = dependencies;
        this.translators = [];
        this.exclamationTranslators = [];
        this.Initialize();
    }
    Initialize() {
        this.scheduleLister = new ScheduleLister_1.ScheduleLister(this.dependencies);
        this.translators.push(this.scheduleLister);
        this.translators.push(new ConfigSetter_1.ConfigSetter(this.dependencies));
        this.translators.push(new SearchPlayers_1.SearchPlayers(this.dependencies));
        this.translators.push(new TeamChecker_1.TeamNameChecker(this.dependencies));
        this.translators.push(new AssignRoles_1.AssignRoles(this.dependencies));
        this.translators.push(new RegisteredCount_1.RegisteredCount(this.dependencies));
        this.translators.push(new Purge_1.Purge(this.dependencies));
        this.translators.push(new Reload_1.Reload(this.dependencies));
        this.translators.push(new GamesCommand_1.GamesCommand(this.dependencies));
        this.translators.push(new NonCastedGamesCommand_1.NonCastedGamesCommand(this.dependencies));
        this.translators.push(new Leave_1.Leave(this.dependencies));
        this.translators.push(new UnusedRoles_1.UnUsedRoles(this.dependencies));
        this.translators.push(new UpdateCaptainsList_1.UpdateCaptainsList(this.dependencies));
        this.translators.push(new WatchSchedule_1.WatchSchedule(this.dependencies));
        this.translators.push(new SelfAssignRolesCreator_1.SelfAssignRolesCreator(this.dependencies));
        this.translators.push(new SelfAssignRolesRemover_1.SelfAssignRolesRemover(this.dependencies));
        this.translators.push(new Random_1.RandomTranslator(this.dependencies));
        this.translators.push(new TestTranslator_1.TestTranslator(this.dependencies));
        this.translators.push(new Cleanup_1.CleanupTranslator(this.dependencies));
        this.translators.push(new SeasonInformation_1.SeasonInformation(this.dependencies));
        this.translators.push(new commandLister_1.CommandLister(this.dependencies, this.translators));
        this.exclamationTranslators.push(new SelfAssignRolesWatcher_1.SelfAssignRolesWatcher(this.dependencies));
        this.exclamationTranslators.push(new CoinFlip_1.CoinFlip(this.dependencies));
    }
    runTranslators(message) {
        const originalContent = message.content;
        const trimmedValue = originalContent.substring(1);
        const command = this.botCommand;
        let regex = new RegExp(`^${command}`, "g");
        if (regex.test(originalContent)) {
            for (const translator of this.translators) {
                translator.Translate(trimmedValue, message);
            }
        }
        else if (/^\!/.test(originalContent)) {
            for (const translator of this.exclamationTranslators) {
                translator.Translate(trimmedValue, message);
            }
        }
    }
}
exports.TranslatorService = TranslatorService;
//# sourceMappingURL=TranslatorService.js.map