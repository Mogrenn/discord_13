import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Shuffle } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffle the queue"),
    async execute(interaction: CommandInteraction) {
        interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Shuffle(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;