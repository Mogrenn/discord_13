import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { LoopSong } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("loopsong")
        .setDescription("Loop current song"),
    async execute(interaction: CommandInteraction) {
        interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            LoopSong(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;