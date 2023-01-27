import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { SendResult } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("gameshowshowresult")
        .setDescription("Shows the answers to all participants"),
    async execute(interaction: CommandInteraction) {
        await SendResult(interaction);
    },
};

export const Command = command;
