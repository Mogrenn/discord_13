import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
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
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRoleName} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await ToggleAcceptAnswer(interaction);
    },
};

export const Command = command;
