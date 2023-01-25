import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { CreateGameShow } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("startgameshow")
        .setDescription("Sends a guess to game-master-channel")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("What is then name of the gameshow")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        await CreateGameShow(interaction);
    },
};

export const Command = command;
