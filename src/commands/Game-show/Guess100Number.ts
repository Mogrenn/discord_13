import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRolePublic } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { Guess100 } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("guess100")
        .setDescription("Sends your guess to the server")
        .addNumberOption(option =>
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
        await Guess100(interaction);
    },
};

export const Command = command;
