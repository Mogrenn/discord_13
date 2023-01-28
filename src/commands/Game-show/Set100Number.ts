import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
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
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRoleName} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await Set100Number(interaction);
    },
};

export const Command = command;
