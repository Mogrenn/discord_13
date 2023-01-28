import { GuildMember } from "discord.js";

export async function HasGuildRole(user: GuildMember, roleName: string): Promise<boolean> {
    const test = user.roles.cache.filter(r => r.name === roleName);
    return test.size > 0;
}