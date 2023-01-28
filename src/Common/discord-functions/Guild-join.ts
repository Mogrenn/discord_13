import { ChannelType, Client, Guild, Role } from "discord.js";
import { gameShowRoleName, gameShowNameMaster, gameShowPublic, gameShowRolePublic } from "../consts";
import { CreateChannel } from "./Guild-Channel";

export async function GameShowJoin({client, guild}: {client?: Client, guild?: Guild}) {
    if (client) {
        client.guilds.cache.forEach(async guild => {
            await GameShowCreateRoleAndChannel(guild);
        });
    } else {
        await GameShowCreateRoleAndChannel(guild);
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
        if (channel.type === ChannelType.GuildText) {
            if (channel.name === gameShowNameMaster) gameShowMasterFound = true;
            if (channel.name === gameShowPublic) gameShowPublicFound = true;
        }
    });

    let gameMaster: Role;
    if (!gameMasterRoleFound) {
        gameMaster = await guild.roles.create({
            name: gameShowRoleName,
            permissions: "Administrator"
        });
        await guild.roles.create({
            name: gameShowRolePublic,
        });
    }

    const everyone = guild.roles.cache.find(r => r.name === '@everyone');
    
    if (!gameShowMasterFound) {
        if (!gameMaster) gameMaster =  guild.roles.cache.find(r => r.name === gameShowRoleName);

        await CreateChannel(guild, {
            name: gameShowNameMaster,
            permissionOverwrites: [
                {
                    id: gameMaster.id,
                    allow: ['ViewChannel']
                },
                {
                    id: everyone.id,
                    deny: ['ViewChannel']
                }
            ]
        });
    }

    if (!gameShowPublicFound) {
        await CreateChannel(guild, {
            name: gameShowPublic
        });
    }
}