import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowNameMaster } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { Show100Result } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("show100result")
        .setDescription("Shows the current standings"),
    async execute(interaction: CommandInteraction) {
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowNameMaster))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowNameMaster} have access to this command`});
            return;
        }
        await Show100Result(interaction);
    },
};

export const Command = command;
