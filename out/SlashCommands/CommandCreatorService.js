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
exports.HelloCommand = exports.Command = exports.CommandCreatorService = void 0;
const DiscordGuilds_1 = require("../enums/DiscordGuilds");
class CommandCreatorService {
    constructor(client) {
        this.client = client;
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
        return __awaiter(this, void 0, void 0, function* () {
            const commandsToRegister = [];
            for (const command of this.commands) {
                commandsToRegister.push(command.GetCommand());
            }
            const guild = yield this.client.guilds.fetch(DiscordGuilds_1.DiscordGuilds.DeltasServer);
            yield (guild === null || guild === void 0 ? void 0 : guild.commands.set(commandsToRegister));
            console.log("done");
        });
    }
    CreateCommands() {
        this.commands.push(new HelloCommand());
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
            if (!slashCommand) {
                interaction.followUp({ content: "An error has occurred" });
                return;
            }
            yield interaction.deferReply();
            yield slashCommand.RunCommand(client, interaction);
        });
    }
    ;
}
exports.CommandCreatorService = CommandCreatorService;
class Command {
    constructor() {
        this.type = 1 /* ApplicationCommandTypes.CHAT_INPUT */;
    }
    GetCommand() {
        this.command = {
            description: this.Description,
            name: this.Name
        };
        return this.command;
    }
}
exports.Command = Command;
class HelloCommand extends Command {
    constructor() {
        super(...arguments);
        this.Description = "Will Tell the User Hello";
        this.Name = "helloworld";
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.followUp({
                ephemeral: true,
                content: "Hello World"
            });
        });
    }
}
exports.HelloCommand = HelloCommand;
//# sourceMappingURL=CommandCreatorService.js.map