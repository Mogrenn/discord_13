import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { Reset100 } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("reset100")
        .setDescription("Resets the 100 game mode"),
    async execute(interaction: CommandInteraction) {
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRoleName} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await Reset100(interaction);
    },
};

export const Command = command;
