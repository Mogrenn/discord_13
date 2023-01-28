import { GuildMember } from "discord.js";

export async function HasGuildRole(user: GuildMember, roleName: string): Promise<boolean> {
    return user.roles.cache.has(roleName);;
}