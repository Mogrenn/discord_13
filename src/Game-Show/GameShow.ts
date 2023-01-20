import { Snowflake } from "discord-api-types";
import { CommandInteraction } from "discord.js";

class GameShow {

    private GameShowTextChannel: Snowflake;
    private gameShowVoiceChannel: Snowflake;
    private participants: Snowflake[];

    constructor(interaction: CommandInteraction) {
        const test = interaction.guild.channels.cache;

        test.find(channel => channel.name === "test")
    }

    
}

export function StartGameShow(interaction: CommandInteraction) {
    return new GameShow(interaction);
}