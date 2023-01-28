import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Show100Result } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("show100result")
        .setDescription("Shows the current standings"),
    async execute(interaction: CommandInteraction) {
        await Show100Result(interaction);
    },
};

export const Command = command;
