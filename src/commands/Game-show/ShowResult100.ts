import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { Show100Result } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("show100result")
        .setDescription("Shows the current standings"),
    async execute(interaction: CommandInteraction) {
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRoleName} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await Show100Result(interaction);
    },
};

export const Command = command;
