import { Client, Guild, Role } from "discord.js";
import { gameShowRoleName, gameShowNameMaster, gameShowPublic } from "../consts";
import { CreateChannel } from "./Guild-Channel";

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
    let gameShowMasterFound = false;
    let gameShowPublicFound = false;
    let gameMasterRoleFound = false;
    guild.roles.cache.forEach(role => {
        if (role.name === gameShowRoleName) gameMasterRoleFound = true;
    });

    guild.channels.cache.forEach(channel => {
        if (channel.type === "GUILD_TEXT") {
            if (channel.name === gameShowNameMaster) gameShowMasterFound = true;
            if (channel.name === gameShowPublic) gameShowPublicFound = true;
        }
    });

    let gameMaster: Role;
    if (!gameMasterRoleFound) {
        gameMaster = await guild.roles.create({
            name: gameShowRoleName,
            permissions: "ADMINISTRATOR"
        });
        await guild.roles.create({
            name: "game-show-participant",
        });
    }

    const everyone = guild.roles.cache.find(r => r.name === '@everyone');
    
    if (!gameShowMasterFound) {
        if (!gameMaster) gameMaster =  guild.roles.cache.find(r => r.name === gameShowRoleName);

        await CreateChannel(guild, gameShowNameMaster, {
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

    if (!gameShowPublicFound) {
        await CreateChannel(guild, gameShowPublic, {});
    }
}