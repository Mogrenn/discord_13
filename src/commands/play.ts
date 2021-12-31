import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import { CreateSubscription } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Request a song")
        .addStringOption(option => 
		    option.setName("song")
			.setDescription("The song url to be played")
			.setRequired(true)
	    ),
    async execute(interaction: CommandInteraction) {
        interaction.deferReply();
        
        if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
            CreateSubscription(interaction.guildId, (interaction.member as GuildMember).voice.channel as VoiceChannel, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;