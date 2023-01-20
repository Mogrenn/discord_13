import { Client, Guild, Role } from "discord.js";
import { CreateChannel } from "./Guild-Channel";

const gameShowName = "gameshow-master"
const gameShowRoleName = "GameMaster"

export async function GameShowJoin({client, guild}: {client?: Client, guild?: Guild}) {
    if (client) {
        client.guilds.cache.forEach(async guild => {
            GameShowCreateRoleAndChannel(guild);
        });
    } else {
        GameShowCreateRoleAndChannel(guild);
    }
}

async function GameShowCreateRoleAndChannel(guild: Guild) {
    let gameShowFound = false;
    let roleFound = false;
    guild.roles.cache.forEach(role => {
        if (role.name === gameShowRoleName) roleFound = true;
    });

    guild.channels.cache.forEach(channel => {
        if (channel.type === "GUILD_TEXT") {
            if (channel.name === gameShowName) gameShowFound = true;
        }
        
    });

    let gameMaster: Role;
    if (!roleFound) {
        gameMaster = await guild.roles.create({
            name: gameShowRoleName,
            permissions: "ADMINISTRATOR"
        });
    }

    const everyone = guild.roles.cache.find(r => r.name === '@everyone');
    
    if (!gameShowFound) {
        if (!gameMaster) gameMaster =  guild.roles.cache.find(r => r.name === gameShowRoleName);

        await CreateChannel(guild, gameShowName, {
            permissionOverwrites: [
                {
                    id: gameMaster.id,
                    allow: ['VIEW_CHANNEL']
                },
                {
                    id: everyone.id,
                    deny: ['VIEW_CHANNEL']
                }
            ]
        });
    }
}