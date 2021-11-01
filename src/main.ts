import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, CommandInteraction, GuildMember, Intents, VoiceChannel } from "discord.js";
import { join } from "path";
import { CreateSubscription, Leave, Pause, Resume, Skip } from "./music/music-handler";
require("dotenv").config({path: ".env"});

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const secretSongActive = false;
let secretSongConnection: VoiceConnection | undefined;

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
    
    const { commandName } = interaction;
    
    try {
        switch (commandName) {
            case "ping":
                await interaction.reply({content: "Pong!", ephemeral: true});
                break;
            case "play":
                interaction.deferReply();
                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    CreateSubscription(interaction.guildId, (interaction.member as GuildMember).voice.channel as VoiceChannel, interaction);
                } else {
                    await interaction.reply("You need to connect to a voice channel");
                }
                break;
            case "queue":
                break;
            case "skip":
                interaction.deferReply();
                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    Skip(interaction.guildId, interaction);
                } else {
                    await interaction.reply("You need to connect to a voice channel");
                }
                break;
            case "pause":
                interaction.deferReply();

                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    Pause(interaction.guildId, interaction);
                } else {
                    await interaction.reply("You need to connect to a voice channel");
                }
                break;
            case "resume":
                interaction.deferReply();

                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    Resume(interaction.guildId, interaction);
                } else {
                    await interaction.reply("You need to connect to a voice channel");
                }
                break;
            case "leave":
                interaction.deferReply();

                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    Leave(interaction.guildId, interaction);
                } else {
                    await interaction.reply("You need to connect to a voice channel");
                }
                break;
            default:
                await interaction.reply("Could not find command");
                break;
        }
    } catch(e) {
        console.log(e);
    }
    
});

client.login(process.env.TOKEN);