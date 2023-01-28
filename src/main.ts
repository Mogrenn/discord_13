import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Collection, CommandInteraction, GatewayIntentBits, TextChannel, VoiceState } from "discord.js";
import { join } from "path";
import { SlashCommandBuilder } from "@discordjs/builders";
import { GetFiles } from "./Common";
import { GameShowJoin } from "./Common/discord-functions";
import config from "../config";
require("dotenv").config({path: ".env"});

interface ClientExtended extends Client {
    commands?: Collection<string, {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}>;
}

const client: ClientExtended = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]});
const secretSongActive = false;
let secretSongConnection: VoiceConnection | undefined;

client.commands = new Collection();

client.once("ready", async (client) => {
    await GameShowJoin({client});
    console.log("ready");
});

client.on("guildCreate", async (guild) => {
    try {
        // await guild.roles.create({
        //     name: "bot-commander",
        //     color: "DARK_AQUA",
        //     reason: "This role is created so that users can use special bot commands"
        // });
        await GameShowJoin(guild);
    } catch(e) {
        console.error("Could not add roles to server");
    }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        if (secretSongConnection && newState.channel.members.size > 2) {
            secretSongConnection.disconnect();
            secretSongConnection.destroy();
            secretSongConnection = undefined;
        }

        if (secretSongActive && newState.channel.members.size === 2 && newState.channel.members.some(u => u.id === "226326393783451648") && newState.channel.members.some(u => u.id === "443816218646937602")) {
            await PlaySong(newState, "sound/speechless.mp3");
        } else if (newState.member.user.id === "443816218646937602" && newState.channel.members.size > 1) {
            
            if (!config.ActiveModules.CherryBitch.Active || !config.ActiveModules.CherryBitch.Servers.includes(newState.guild.id)) return;

            await PlaySong(newState, Math.floor(Math.random() * 100) + 1 === 99 ? "sound/theme.mp3" : "sound/Cherry_bitch.mp3");
        }

    }
 });

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;
    
    if (msg.content.startsWith("<@!443816218646937602>") || msg.content.startsWith("<@443816218646937602>")) {
        let roasts = ["You're as useless as the \"ueue\" in \"queue\"", "Mirrors can't talk. Lucky for you they can't laugh either", "hey, you have something on your chin... no, the 3rd one down", "You're the reason the gene pool needs a lifeguard.", "If i had a face like yours, I'd sue my parents.", "Your only chance of getting laid is to crawl up a chicken's butt and wait.", "Some day you'll go far... andi hope you stay there.", "Aha! I see the fuck-up fairy has visited us again", "You must have been born on a highway cus' that's where most accidents happen", "If laughter is the best medicine, your face must be curing the world", "Is your ass jealous of the amount of shit that just came out of your mouth?", "So a thought crossed your mind? Must have been a long and lonely journey", "If i wanted to kill myself I'd climb your ego and jump to your IQ", "I'd agree with you but then we'd both be wrong", "When I see your face there's not a thing I would change... except the direction I was looking in", "If i had a dollar for every time you said something smart, I'd be broke.", "When you were born the doctor threw you out the window, but the window threw you back.", "You're the reason god created the middle finger", "Your face is just fine but we we'll have to put a bag over that personality", "You bring everyone so much joy when you leave the room", "I thought of you today. It reminded me to take out the trash", "@JeppJeppsson Jesper is boring"];
        let random = Math.floor(Math.random() * roasts.length);

        await msg.reply(roasts[random]);
    }
});

client.on("interactionCreate", async interaction => {

    if (!interaction.isCommand() || !interaction.guildId) return;
    
    const command = client.commands.get(interaction.commandName);

    try {
        await command.execute(interaction);
    } catch(e) {
        console.log(e);
        if (!interaction.deferred && !interaction.replied)
            await interaction.reply("Could not find command");
        else if (interaction.deferred) {
            await interaction.followUp("Could not find command");
        }
    }
});

async function GetCommands() {
    const filePath = join(__dirname, process.env.PROD === "true" ? "dist" : "", "commands");
    const files = await GetFiles(filePath);
    
    let commandPromises: Array<Promise<void>> = [];
    for (const file of files) {
        commandPromises.push(new Promise(async (resolve) => {
            try {
                const { Command }: {Command: {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}} = await import(`${file}`);
                client.commands!.set(Command.data.name, Command);
                resolve();
            } catch(e) {
                console.error(e);
                resolve();
            }
        }));
    }

    await Promise.all(commandPromises);
    await client.login(process.env.TOKEN);
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
    audio.volume.setVolume(0.5);
    player.play(audio);
    con.subscribe(player);
}

GetCommands();
