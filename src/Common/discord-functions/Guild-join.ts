import { ChannelType, Client, Guild, PermissionsBitField, Role } from "discord.js";
import { gameShowRoleName, gameShowNameMaster, gameShowPublic, gameShowRolePublic } from "../consts";
import { CreateChannel } from "./Guild-Channel";

export async function GameShowJoin({client, guild}: {client?: Client, guild?: Guild}) {
    if (client) {
        await Promise.all(client.guilds.cache.map(async guild => {
            await GameShowCreateRoleAndChannel(guild);
        }));
    } else {
        await GameShowCreateRoleAndChannel(guild);
    }
}

async function GameShowCreateRoleAndChannel(guild: Guild) {
    if (guild.name === "Reunited With Friends" || guild.name === "Kingdom of Jons Mentality"){
        return;
    }
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
            name: gameShowRoleName
        });
        
        await guild.roles.create({
            name: gameShowRolePublic,
        });
    }

    const everyone = guild.roles.cache.find(r => r.name === '@everyone');
    
    if (!gameShowMasterFound) {
        if (gameMaster === undefined) gameMaster =  guild.roles.cache.find(r => r.name === gameShowRoleName);
        
        await CreateChannel(guild, {
            name: gameShowNameMaster,
            permissionOverwrites: [
                {
                    id: gameMaster.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
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