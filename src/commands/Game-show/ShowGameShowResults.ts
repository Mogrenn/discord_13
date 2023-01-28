import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowNameMaster } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { SendResult } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("gameshowshowresult")
        .setDescription("Shows the answers to all participants"),
    async execute(interaction: CommandInteraction) {
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowNameMaster))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowNameMaster} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await SendResult(interaction);
    },
};

export const Command = command;
