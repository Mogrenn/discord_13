import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with pong"),
        async execute(interaction: CommandInteraction) {
            await interaction.reply({content: "Pong!", ephemeral: true});
        },
};

export const Command = command;