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
const discord_js_1 = require("discord.js");
const CaptainsCommand_1 = require("./Commands/CaptainsCommand");
const GamesSlashCommand_1 = require("./Commands/GamesSlashCommand");
const RandomSlashCommand_1 = require("./Commands/RandomSlashCommand");
const RoleHelperCommand_1 = require("./Commands/RoleHelperCommand");
class CommandCreatorService {
    constructor(client, dataStore, mongoConnectionUri) {
        this.client = client;
        this.dataStore = dataStore;
        this.mongoConnectionUri = mongoConnectionUri;
        this.commands = [];
        client.on("interactionCreate", (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isButton()) {
                yield this.RunCommand(client, interaction);
            }
        }));
        client.on("ready", () => {
            this.CreateCommands();
            this.Registercommands();
        });
    }
    Registercommands() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            var containers = this.CreateCommandContainers();
            for (var container of containers.guildCommands) {
                const guild = yield this.client.guilds.fetch(container.guild);
                yield (guild === null || guild === void 0 ? void 0 : guild.commands.set(container.commands));
            }
            if (containers.applicationCommands.length > 0)
                yield ((_a = this.client.application) === null || _a === void 0 ? void 0 : _a.commands.set(containers.applicationCommands));
            (_b = this.client.application) === null || _b === void 0 ? void 0 : _b.commands.cache.forEach(command => {
                console.log(`commandName: ${command.name}, applicationId: ${command.id}`);
            });
            this.client.guilds.cache.forEach(guild => {
                guild.commands.cache.forEach(command => {
                    console.log(`Guild information: commandName: ${command.name}, applicationId: ${command.id}`);
                });
            });
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
        this.commands.push(new GamesSlashCommand_1.GamesSlashCommand(this.dataStore));
        this.commands.push(new RandomSlashCommand_1.RandomSlashCommand());
        this.commands.push(new CaptainsCommand_1.CaptainsCommand(this.dataStore, this.mongoConnectionUri));
        this.commands.push(new RoleHelperCommand_1.RoleHelperCommand(this.dataStore, this.mongoConnectionUri));
        // this.commands.push(new SearchDBDCommand(this.mongoConnectionUri));
    }
    RunCommand(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction instanceof discord_js_1.CommandInteraction) {
                const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
                if (!slashCommand) {
                    interaction.followUp({ content: "An error has occurred" });
                    return;
                }
                yield interaction.deferReply({ ephemeral: slashCommand.Ephemeral });
                yield slashCommand.RunCommand(client, interaction);
            }
            if (interaction instanceof discord_js_1.ButtonInteraction) {
                const splitId = interaction.customId.split(":");
                const buttonCommand = this.commands.find(c => {
                    if (c.Name == splitId[0]) {
                        return true;
                    }
                    return false;
                });
                if (buttonCommand) {
                    yield interaction.deferReply({ ephemeral: buttonCommand.Ephemeral });
                    yield buttonCommand.RunButton(client, interaction);
                }
            }
        });
    }
    ;
}
exports.CommandCreatorService = CommandCreatorService;
//# sourceMappingURL=CommandCreatorService.js.map