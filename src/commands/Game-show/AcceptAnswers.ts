import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ToggleAcceptAnswer } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("gameshowtoggleanswers")
        .setDescription("toggles the option to listen for answers")
        .addStringOption(option =>
            option.setName("guess")
                .setDescription("What is then name of the gameshow")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        await ToggleAcceptAnswer(interaction);
    },
};

export const Command = command;
