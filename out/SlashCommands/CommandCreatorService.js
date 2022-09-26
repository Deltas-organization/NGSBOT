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
exports.CommandCreatorService = void 0;
const GamesSlashCommand_1 = require("./Commands/GamesSlashCommand");
const HelloWorldCommand_1 = require("./Commands/HelloWorldCommand");
class CommandCreatorService {
    constructor(client, dataStore) {
        this.client = client;
        this.dataStore = dataStore;
        this.commands = [];
        client.on("interactionCreate", (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (interaction.isCommand() || interaction.isContextMenu()) {
                yield this.RunCommand(client, interaction);
            }
        }));
        client.on("ready", () => {
            this.CreateCommands();
            this.Registercommands();
        });
    }
    Registercommands() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var containers = this.CreateCommandContainers();
            for (var container of containers.guildCommands) {
                const guild = yield this.client.guilds.fetch(container.guild);
                yield (guild === null || guild === void 0 ? void 0 : guild.commands.set(container.commands));
            }
            if (containers.applicationCommands.length > 0)
                yield ((_a = this.client.application) === null || _a === void 0 ? void 0 : _a.commands.set(containers.applicationCommands));
            console.log("done");
        });
    }
    CreateCommandContainers() {
        const guildCommandsToRegister = [];
        const applicationcommandsToRegister = [];
        for (const command of this.commands) {
            if (command.GuildLocation === 'All') {
                applicationcommandsToRegister.push(command.GetCommand());
            }
            else {
                let found = false;
                for (const guildCommand of guildCommandsToRegister) {
                    if (guildCommand.guild == command.GuildLocation) {
                        guildCommand.commands.push(command.GetCommand());
                        found = true;
                        break;
                    }
                }
                if (!found)
                    guildCommandsToRegister.push({ guild: command.GuildLocation, commands: [command.GetCommand()] });
            }
        }
        return { guildCommands: guildCommandsToRegister, applicationCommands: applicationcommandsToRegister };
    }
    CreateCommands() {
        this.commands.push(new HelloWorldCommand_1.HelloWorldCommand());
        this.commands.push(new GamesSlashCommand_1.GamesSlashCommand(this.dataStore));
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
            if (!slashCommand) {
                interaction.followUp({ content: "An error has occurred" });
                return;
            }
            yield interaction.deferReply({ ephemeral: slashCommand.Ephemeral });
            yield slashCommand.RunCommand(client, interaction);
        });
    }
    ;
}
exports.CommandCreatorService = CommandCreatorService;
//# sourceMappingURL=CommandCreatorService.js.map