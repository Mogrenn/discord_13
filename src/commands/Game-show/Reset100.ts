import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Reset100 } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("reset100")
        .setDescription("Resets the 100 game mode"),
    async execute(interaction: CommandInteraction) {
        await Reset100(interaction);
    },
};

export const Command = command;
