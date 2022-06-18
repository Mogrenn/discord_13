import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Queue } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Display the current queue"),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Queue(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;
