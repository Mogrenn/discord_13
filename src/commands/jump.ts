import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Jump } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("jump")
        .setDescription("Jumps playlist to given position in current queue")
        .addNumberOption(option =>
            option.setName("target")
            .setDescription("Position to jump to")
            .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Jump(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;
