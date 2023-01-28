import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Set100Number } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("set100number")
        .setDescription("Sets the number to guess")
        .addNumberOption(option =>
            option.setName("number")
                .setDescription("Number to guess")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await Set100Number(interaction);
    },
};

export const Command = command;
