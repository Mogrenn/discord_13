import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, CreateAudioPlayerOptions, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";
import { promisify } from 'node:util';
import { Track } from "./track";

const wait = promisify(setTimeout);

export class MusicSubscription {
    public readonly voiceConnection: VoiceConnection;
    public readonly audioPlayer: AudioPlayer;
    public queue: Track[];
    public queueLock = false;
    public readyLock = false;
    private remove: (guildId: Snowflake) => void;

    constructor(voiceChannel: VoiceChannel, remove: (guildId: Snowflake) => void) {
        this.voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        this.audioPlayer = createAudioPlayer();
        this.queue = [];
        this.remove = remove;

        this.voiceConnection.on('stateChange', async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {

					try {
						// Probably moved voice channel
						await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
					} catch {
						// Probably removed from voice channel
						this.voiceConnection.destroy();
                        this.remove(voiceChannel.guildId);
					}
				} else if (this.voiceConnection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
					this.voiceConnection.rejoin();
				} else {
					this.voiceConnection.destroy();
                    this.remove(voiceChannel.guildId);
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				this.stop();
			} else if (
				!this.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
			) {
				this.readyLock = true;
				try {
					await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				} catch {
					if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                        this.voiceConnection.destroy();
                        this.remove(voiceChannel.guildId);
                    }
				} finally {
					this.readyLock = false;
				}
			}
		});

        this.audioPlayer.on('stateChange', (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
				(oldState.resource as AudioResource<Track>).metadata.onFinish();
				void this.processQueue();
			} else if (newState.status === AudioPlayerStatus.Playing) {
				(newState.resource as AudioResource<Track>).metadata.onStart();
			}
		});

		this.audioPlayer.on('error', (error) => (error.resource as AudioResource<Track>).metadata.onError(error));

		this.voiceConnection.subscribe(this.audioPlayer);
    }

    public enqueue(track: Track) {
		this.queue.push(track);
		void this.processQueue();
	}

	public stop() {
		this.queueLock = true;
		this.queue = [];
		this.audioPlayer.stop(true);
	}

    private async processQueue() {

        if (this.queue.length === 0 || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queueLock) return;
        this.queueLock = true;
        const nextTrack = this.queue.shift();

        try {
            const resource = await nextTrack.createAudioResource();
            this.audioPlayer.play(resource as any);
            this.queueLock = false;
        } catch (e) {
            nextTrack.onError(e as Error);
            this.queueLock = false;
            return this.processQueue();
        }   
    }    

}