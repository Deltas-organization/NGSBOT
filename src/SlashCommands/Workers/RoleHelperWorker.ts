import { Guild, Role, User } from "discord.js";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../../helpers/MessageHelper";
import { ScheduleHelper } from "../../helpers/ScheduleHelper";
import { INGSTeam } from "../../interfaces";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { SelectedButtons } from "../../enums/SelectedButtons";
import { Mongohelper } from "../../helpers/Mongohelper";

export class RoleHelperWorker {

  mongoHelper: Mongohelper;

  public constructor(private dataStore: DataStoreWrapper, mongoConnectionUri: string, private guild: Guild) {
    this.mongoHelper = new Mongohelper(mongoConnectionUri);
  }

  private async CreateRole(roleName: string): Promise<Role> {
    return await this.guild.roles.create({
      name: roleName,
      mentionable: true,
      hoist: true,
      reason: 'needed a new team role added'
    });
  }
}