import { Message } from "discord.js";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { ITranslate } from "../../interfaces/ITranslator";
import { AssignRoles } from "../AssignRoles";
import { CleanupTranslator } from "../Cleanup";
import { CoinFlip } from "../CoinFlip";
import { CommandLister } from "../commandLister";
import { ConfigSetter } from "../ConfigSetter";
import { GamesCommand } from "../GamesCommand";
import { Leave } from "../Leave";
import { SelfAssignRolesCreator } from "../mongo/SelfAssignRolesCreator";
import { SelfAssignRolesRemover } from "../mongo/SelfAssignRolesRemover";
import { SelfAssignRolesWatcher } from "../mongo/SelfAssignRolesWatcher";
import { NonCastedGamesCommand } from "../NonCastedGamesCommand";
import { Purge } from "../Purge";
import { RandomTranslator } from "../Random";
import { RegisteredCount } from "../RegisteredCount";
import { Reload } from "../Reload";
import { ScheduleLister } from "../ScheduleLister";
import { SearchPlayers } from "../SearchPlayers";
import { SeasonInformation } from "../SeasonInformation";
import { TeamNameChecker } from "../TeamChecker";
import { TestTranslator } from "../TestTranslator";
import { UnUsedRoles } from "../UnusedRoles";
import { UpdateCaptainsList } from "../UpdateCaptainsList";
import { WatchSchedule } from "../WatchSchedule";

export class TranslatorService {

    private translators: ITranslate[] = [];
    private exclamationTranslators: ITranslate[] = [];
    private scheduleLister: ScheduleLister;

    constructor(private botCommand: string, private dependencies: CommandDependencies) {
        this.Initialize();
    }

    private Initialize() {

        this.scheduleLister = new ScheduleLister(this.dependencies);
        this.translators.push(this.scheduleLister);
        this.translators.push(new ConfigSetter(this.dependencies));
        this.translators.push(new SearchPlayers(this.dependencies));
        this.translators.push(new TeamNameChecker(this.dependencies));
        this.translators.push(new AssignRoles(this.dependencies));
        this.translators.push(new RegisteredCount(this.dependencies));
        this.translators.push(new Purge(this.dependencies));
        this.translators.push(new Reload(this.dependencies));
        this.translators.push(new GamesCommand(this.dependencies));
        this.translators.push(new NonCastedGamesCommand(this.dependencies));
        this.translators.push(new Leave(this.dependencies));
        this.translators.push(new UnUsedRoles(this.dependencies));
        this.translators.push(new UpdateCaptainsList(this.dependencies));
        this.translators.push(new WatchSchedule(this.dependencies));
        this.translators.push(new SelfAssignRolesCreator(this.dependencies));
        this.translators.push(new SelfAssignRolesRemover(this.dependencies));
        this.translators.push(new RandomTranslator(this.dependencies));
        this.translators.push(new TestTranslator(this.dependencies));
        this.translators.push(new CleanupTranslator(this.dependencies));
        this.translators.push(new SeasonInformation(this.dependencies));

        this.translators.push(new CommandLister(this.dependencies, this.translators));
        this.exclamationTranslators.push(new SelfAssignRolesWatcher(this.dependencies));
        this.exclamationTranslators.push(new CoinFlip(this.dependencies));
    }

    public runTranslators(message: Message) {
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