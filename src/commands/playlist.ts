import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Playlist } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Play a playlist of songs")
        .addStringOption(option =>
            option.setName("playlist")
            .setDescription("Enter a playlist url")
            .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Playlist(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;
