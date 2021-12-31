import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Search } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for a song")
        .addStringOption(option => 
            option.setName("search")
            .setDescription("Text to search on")
            .setRequired(true)	
	    ),
    async execute(interaction: CommandInteraction) {
        interaction.deferReply();

        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            Search(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;