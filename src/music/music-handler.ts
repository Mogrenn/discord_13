import { entersState, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandInteraction, GuildMember, Interaction, Snowflake, VoiceChannel } from "discord.js";
import { MusicSubscription } from "./MusicSubscription";
import { Track } from "./track";

class MusicSubscriptionSingleton {
    private static instance: MusicSubscriptionSingleton;
    private musicSubscriptions = new Map<Snowflake, MusicSubscription>()
    constructor() {}

    public static GetInstance() {
        if (!MusicSubscriptionSingleton.instance) {
            MusicSubscriptionSingleton.instance = new MusicSubscriptionSingleton();
        }
        return MusicSubscriptionSingleton.instance;
    }

    async CreateSubscription(guildId: Snowflake, voiceConnection: VoiceChannel, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            this.musicSubscriptions.get(guildId)
            this.AddSong(guildId, interaction);
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

    async CreateTrack(interaction: CommandInteraction) {
        const url = interaction.options.get('song')!.value! as string;
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
            this.musicSubscriptions.get(guildId).stop();
            await interaction.followUp(`Skipping current song`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Pause(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.audioPlayer.pause();
            await interaction.followUp(`Paused current song`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Resume(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.audioPlayer.unpause();
            await interaction.followUp(`Resumed current song`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
    }

    public async Leave(guildId: Snowflake, interaction: CommandInteraction) {
        if (this.musicSubscriptions.has(guildId)) {
            let sub = this.musicSubscriptions.get(guildId);
            sub.voiceConnection.destroy();
            await interaction.followUp(`Left current voice channel`);
        } else {
            await interaction.followUp("Join a voice channel before starting to play music");
        }
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