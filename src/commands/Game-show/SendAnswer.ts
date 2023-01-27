import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { SendAnswer } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("sendgameshowanswer")
        .setDescription("Sends your guess to the server")
        .addStringOption(option =>
            option.setName("guess")
                .setDescription("Your guess")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await SendAnswer(interaction);
    },
};

export const Command = command;
