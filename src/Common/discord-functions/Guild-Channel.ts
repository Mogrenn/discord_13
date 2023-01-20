import { Guild, GuildChannelCreateOptions } from "discord.js";

export async function CreateChannel(guild: Guild, channelName: string, options: GuildChannelCreateOptions) {
    await guild.channels.create(channelName, options);
}