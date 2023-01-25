import { Guild, GuildChannelCreateOptions } from "discord.js";

export async function CreateChannel(guild: Guild, options: GuildChannelCreateOptions) {
    await guild.channels.create(options);
}