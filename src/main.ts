import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Collection, CommandInteraction, Intents } from "discord.js";
import { join } from "path";
import { Query } from "./Database/database-connection";
require("dotenv").config({path: ".env"});
import * as fs from "fs";
import { SlashCommandBuilder } from "@discordjs/builders";

interface ClientExtended extends Client {
    commands?: Collection<string, {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}>;
}

const client: ClientExtended = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const secretSongActive = false;
let secretSongConnection: VoiceConnection | undefined;
let res = Query<{id: number, username: string}>(`
    SELECT 
        *
    FROM
        user
`);

client.commands = new Collection();



client.once("ready", () => {
    console.log("ready");
});

client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState.member.user.bot) return;
    if (!oldState.channelId && newState.channelId) {
        if (secretSongConnection && newState.channel.members.size > 2) {
            secretSongConnection.disconnect();
            secretSongConnection.destroy();
            secretSongConnection = undefined;
        }

        if (secretSongActive && newState.channel.members.size === 2 && newState.channel.members.some(u => u.id === "226326393783451648") && newState.channel.members.some(u => u.id === "443816218646937602")) {
            secretSongConnection = joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });

            const player = createAudioPlayer();
            player.on("error", error => {
                console.log(error);
            }).on(AudioPlayerStatus.Idle, () => {
                secretSongConnection.disconnect();
                secretSongConnection.destroy();
            });
    
            const audio = createAudioResource(join(__dirname, "sound/speechless.mp3"));
            audio.playStream.on('error', error => {
                console.error('Error:', error.message);
            });
    
            player.play(audio);
            secretSongConnection.subscribe(player);
        } else if (newState.member.user.id === "443816218646937602" && newState.channel.members.size > 1) {
            const con = joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });
    
            const player = createAudioPlayer();
            player.on("error", error => {
                console.log(error);
            }).on(AudioPlayerStatus.Idle, () => {
                con.disconnect();
                con.destroy();
            });
    
            const audio = createAudioResource(join(__dirname, "sound/Cherry_bitch.mp3"));
            audio.playStream.on('error', error => {
                console.error('Error:', error.message);
            });

            player.play(audio);
            con.subscribe(player);
        }
    } else if (oldState.channelId && !newState.channelId) {
        //If user leaves
        // if (secretSongConnection && oldState.channel.members.size < 2) {
        //     secretSongConnection.disconnect();
        //     secretSongConnection.destroy();
        //     secretSongConnection = undefined;
        // }
    }
 });

client.on("interactionCreate", async interaction => {

    if (!interaction.isCommand() || !interaction.guildId) return;
    
    const command = client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch(e) {
        await interaction.reply("Could not find command");
    }

    
});

async function GetCommands() {
    const clientCommands = fs.readdirSync(`./${process.env.PROD === "true" ? "dist" : "src"}/commands`);
    
    let commandPromises: Array<Promise<void>> = [];
    for (const file of clientCommands) {
        commandPromises.push(new Promise(async (resolve) => {
            const { Command }: {Command: {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}} = await import(`./commands/${file}`);
            client.commands!.set(Command.data.name, Command);
            resolve();
        }));
    }

    await Promise.all(commandPromises);
    client.login(process.env.TOKEN);
}

GetCommands();