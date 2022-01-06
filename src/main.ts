import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Collection, CommandInteraction, Intents, VoiceState } from "discord.js";
import { join } from "path";
require("dotenv").config({path: ".env"});
import * as fs from "fs";
import { SlashCommandBuilder } from "@discordjs/builders";

interface ClientExtended extends Client {
    commands?: Collection<string, {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}>;
}

const client: ClientExtended = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const secretSongActive = false;
let secretSongConnection: VoiceConnection | undefined;

client.commands = new Collection();

client.once("ready", () => {
    console.log("ready");
});

client.on("guildCreate", (guild) => {
    try {
        guild.roles.create({
            name: "bot-commander",
            color: "DARK_AQUA",
            reason: "This role is created so that users can use special bot commands"
        });
    } catch(e) {
        console.error("Could not add roles to server");
    }
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
            PlaySong(newState, "sound/speechless.mp3");
        } else if (newState.member.user.id === "443816218646937602" && newState.channel.members.size > 1) {
            PlaySong(newState, Math.floor(Math.random()*100)+1 === 99 ? "sound/theme.mp3" : "sound/Cherry_bitch.mp3");
        }

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
            try {
                const { Command }: {Command: {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}} = await import(`./commands/${file}`);
                client.commands!.set(Command.data.name, Command);
                resolve();
            } catch(e) {
                console.error(e);
                resolve();
            }
            
        }));
    }

    await Promise.all(commandPromises);
    client.login(process.env.TOKEN);
}

async function PlaySong(newState: VoiceState, songPath: string) {
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

    const audio = createAudioResource(join(__dirname, songPath));
    audio.playStream.on('error', error => {
        console.error('Error:', error.message);
    });

    player.play(audio);
    con.subscribe(player);
}

GetCommands();