import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Resume } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume current playing song"),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Resume(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;
