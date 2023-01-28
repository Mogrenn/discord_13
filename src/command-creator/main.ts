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
	new SlashCommandBuilder().setName("search").setDescription("Search for a song").addStringOption(option => 
		option.setName("search")
			.setDescription("Text to search on")
			.setRequired(true)	
	),
	new SlashCommandBuilder().setName("playlist").setDescription("Play a playlist of songs").addStringOption(option => 
		option.setName("playlist")
			.setDescription("Enter a playlist url")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the queue"),
	new SlashCommandBuilder().setName("loopsong").setDescription("Loop current song"),
	new SlashCommandBuilder().setName("loopplaylist").setDescription("Loop current playlist"),
	new SlashCommandBuilder().setName("volume").setDescription("Change the volume").addNumberOption(option => 
		option.setName("newvolume")
			.setDescription("The new volume")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("clearqueue").setDescription("Clears current song queue"),
	new SlashCommandBuilder().setName("jump").setDescription("Jumps playlist to given position in current queue").addNumberOption(option => 
		option.setName("target")
			.setDescription("Position to jump to")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("startgameshow").setDescription("Starts a game show"),
	new SlashCommandBuilder().setName("gameshowtoggleanswers").setDescription("toggles the option to listen for answers"),
	new SlashCommandBuilder().setName("sendgameshowanswer").setDescription("Sends your guess to the server").addStringOption(option => 
		option.setName("guess")
			.setDescription("Your guess")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("gameshowshowresult").setDescription("Shows the answers to all participants"),
	new SlashCommandBuilder().setName("set100number").setDescription("Sets the number to guess").addNumberOption(option =>
		option.setName("number")
			.setDescription("Number to guess")
			.setRequired(true)
    ),
	new SlashCommandBuilder().setName("guess100").setDescription("Sends your guess to the server").addNumberOption(option =>
		option.setName("guess")
			.setDescription("Your guess")
			.setRequired(true)
	),
	new SlashCommandBuilder().setName("reset100").setDescription("Resets the 100 game mode"),
	new SlashCommandBuilder().setName("show100result").setDescription("Shows the current standings")
].map(c => c.toJSON());

//Dev server, Friends server, fake reality server
// if (["242774098772623360", "408340878797701131", "730050315411521546"].includes(process.env.GUILD_ID)) {
// 	let newCommand = new SlashCommandBuilder().setName("intro").setDescription("Toggles intro song").toJSON();
// 	commands.push(newCommand);
// }

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

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