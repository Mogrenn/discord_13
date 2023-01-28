import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Guess100 } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("guess100")
        .setDescription("Sends your guess to the server")
        .addNumberOption(option =>
            option.setName("guess")
                .setDescription("Your guess")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await Guess100(interaction);
    },
};

export const Command = command;
