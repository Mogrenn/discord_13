import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from "@discordjs/builders";
const { Routes } = require('discord-api-types/v9');
require("dotenv").config({path: ".env"});

const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("Replies with pong"),
    new SlashCommandBuilder().setName("play").setDescription("Request a song").addStringOption(option => 
		option.setName("song")
			.setDescription("The song url to be played")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("queue").setDescription("Display the current queue"),
	new SlashCommandBuilder().setName("skip").setDescription("Skip current song"),
	new SlashCommandBuilder().setName("pause").setDescription("Pause current playing song"),
	new SlashCommandBuilder().setName("resume").setDescription("Resume current playing song"),
	new SlashCommandBuilder().setName("leave").setDescription("Forces bot to leave voice channel"),
].map(c => c.toJSON());
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();