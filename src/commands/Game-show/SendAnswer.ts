import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRolePublic } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { SendAnswer } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("sendgameshowanswer")
        .setDescription("Sends your guess to the server")
        .addStringOption(option =>
            option.setName("guess")
                .setDescription("Your guess")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRolePublic))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRolePublic} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await SendAnswer(interaction);
    },
};

export const Command = command;
