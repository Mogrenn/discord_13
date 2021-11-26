import { entersState, VoiceConnectionStatus } from "@discordjs/voice";
import YouTube = require("discord-youtube-api");
import { CommandInteraction, GuildMember, Snowflake, VoiceChannel } from "discord.js";
import { MusicSubscription } from "./MusicSubscription";
import { Track } from "./track";
require("dotenv").config({path: ".env"});

class MusicSubscriptionSingleton {
    private static instance: MusicSubscriptionSingleton;
    private musicSubscriptions = new Map<Snowflake, MusicSubscription>();
    private youtube: YouTube;
    constructor() {
        this.youtube = new YouTube(process.env.GOOGLE_API_key)
    }

    public static GetInstance() {
        if (!MusicSubscriptionSingleton.instance) {
            MusicSubscriptionSingleton.instance = new MusicSubscriptionSingleton();
        }
        return MusicSubscriptionSingleton.instance;
    }

    async CreateSubscription(guildId: Snowflake, voiceConnection: VoiceChannel, interaction: CommandInteraction, playSong = true) {
        if (this.musicSubscriptions.has(guildId)) {
            this.musicSubscriptions.get(guildId)
            playSong && this.AddSong(guildId, interaction);
            return;
        } else {
            this.musicSubscriptions.set(guildId, new MusicSubscription(voiceConnection, (guildId) => {
                this.musicSubscriptions.delete(guildId);
            }));
        }

        const sub = this.musicSubscriptions.get(guildId);

        try {
			await entersState(sub.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
			return;
		}
        if (playSong) {
            try {
                // Attempt to create a Track from the user's video URL
                const track = await this.CreateTrack(interaction);
                sub.enqueue(track);
                await interaction.followUp(`Queued **${track.title}**`);
            } catch (error) {
                console.warn(error);
                await interaction.followUp('Failed to play track, please try again later!');
            }
        }
            

    }

    async CreateTrack(interaction: CommandInteraction, urlString?: string) {
        const url = urlString ? urlString : interaction.options.get('song')!.value! as string;
        try {
			// Attempt to create a Track from the user's video URL
			const track = await Track.from(url, {
				onStart() {
					interaction.followUp({ content: 'Now playing!', ephemeral: false }).catch(console.warn);
				},
				onFinish() {
					interaction.followUp({ content: 'Now finished!', ephemeral: false }).catch(console.warn);
				},
				onError(error) {
					console.warn(error);
					interaction.followUp({ content: `Error: ${error.message}`, ephemeral: false }).catch(console.warn);
				},
			});
			return track;
		} catch (error) {
			console.warn(error);
			await interaction.followUp('Failed to play track, please try again later!');
		}
    }

    RemoveSubscription(guildId: Snowflake) {
        this.musicSubscriptions.delete(guildId);
    }

    public async AddSong(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            const track = await this.CreateTrack(interaction);
            sub.enqueue(track);
            await interaction.followUp(`Queued **${track.title}**`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Skip(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            this.musicSubscriptions.get(guildId).audioPlayer.stop();
            await interaction.followUp(`Skipping current song`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Pause(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.audioPlayer.pause();
            await interaction.followUp({content: `Paused current song`, ephemeral: true});
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Resume(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.audioPlayer.unpause();
            await interaction.followUp({content: `Resumed current song`, ephemeral: true});
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Leave(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.voiceConnection.destroy();
            await interaction.followUp({content: `Left current voice channel`, ephemeral: true});
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Search(guildId: Snowflake, interaction: CommandInteraction) {
        try {
            let video = await this.youtube.searchVideos(interaction.options.get('search').value as string);
            interaction.followUp({content: `Found song ${video.title} and queued song to play`, ephemeral: true});
            if (this.musicSubscriptions.has(guildId)) {
                let sub = this.musicSubscriptions.get(guildId);
                const track = await this.CreateTrack(interaction, this.url(video.id));
                sub.enqueue(track);
                await interaction.followUp(`Queued **${track.title}**`);
            } else {
                if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
                    await this.CreateSubscription(guildId, (interaction.member as GuildMember).voice.channel as VoiceChannel, interaction, false);
                    let sub = this.musicSubscriptions.get(guildId);
                    const track = await this.CreateTrack(interaction, this.url(video.id));
                    sub.enqueue(track);
                    await interaction.followUp(`Queued **${track.title}**`);
                } else {
                    await interaction.followUp("Join a voice channel before starting to play music");
                }
            }
        } catch (e) {
            interaction.followUp({content: "Could not find video", ephemeral: true});
        }
    }

    public async Playlist(guildId: Snowflake, interaction: CommandInteraction) {
        try {
            let musicSubscription: MusicSubscription;
            if (this.musicSubscriptions.has(guildId)) {
                musicSubscription = this.musicSubscriptions.get(guildId);
            } else {
                await this.CreateSubscription(guildId, (interaction.member as GuildMember).voice.channel as VoiceChannel, interaction, false);
                musicSubscription = this.musicSubscriptions.get(guildId);
            }
            console.log(interaction.options.get("playlist").value as string)
            let playlist = await this.youtube.getPlaylist(interaction.options.get("playlist").value as string);
            console.log(playlist);
            playlist.forEach(async e => {
               const track = await this.CreateTrack(interaction, this.url(e.id));
               musicSubscription.enqueue(track);
            });
            await interaction.followUp(`Queued Playlist`);
        } catch(e) {
            await interaction.followUp(`Something whent wrong when trying to queue playlist`);
        }
    }

    public async LoopSong(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            if (sub.getQueue() > 0) {
                sub.toogleLoopSong();
            } else {
                await interaction.followUp({content: `There is not enough songs in the queue`, ephemeral: true});
            }
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async LoopPlaylist(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            if (sub.getQueue() > 0) {
                sub.tooglePlaylist();
            } else {
                await interaction.followUp({content: `There is not enough songs in the queue`, ephemeral: true});
            }
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Shuffle(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            if (sub.getQueue() > 3) {
                sub.shuffle();
            } else {
                await interaction.followUp({content: `There is not enough songs in the queue (Need to be atleast 3)`, ephemeral: true});
            }
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    url(id: string) {
		return `https://www.youtube.com/watch?v=${id}`;
	}

}

export const CreateSubscription = async (guildId: Snowflake, voiceConnection: VoiceChannel, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().CreateSubscription(guildId, voiceConnection, interaction);
}

export const RemoveSubscription = (guildId: Snowflake) => {
    MusicSubscriptionSingleton.GetInstance().RemoveSubscription(guildId);
}

export const Skip = async (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Skip(guildId, interaction);
}

export const Pause = async (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Pause(guildId, interaction);
}

export const Resume = async (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Resume(guildId, interaction);
}

export const Leave = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Leave(guildId, interaction);
}

export const Search = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Search(guildId, interaction);
}

export const Playlist = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Playlist(guildId, interaction);
}

export const Shuffle = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().Shuffle(guildId, interaction);
}

export const LoopSong = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().LoopSong(guildId, interaction);
}

export const LoopPlaylist = (guildId: Snowflake, interaction: CommandInteraction) => {
    MusicSubscriptionSingleton.GetInstance().LoopPlaylist(guildId, interaction);
}