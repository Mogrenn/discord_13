import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { getInfo, videoInfo } from "ytdl-core";

export interface TrackData {
	url: string;
	title: string;
    info: videoInfo;
	onStart: () => void;
	onFinish: () => void;
	onError: (error: Error) => void;
}

const noop = () => {};

export class Track implements TrackData {

    public readonly url: string;
    public readonly title: string;
    public readonly info: videoInfo;
    public readonly onStart: () => void;
    public readonly onFinish: () => void;
    public readonly onError: (error: Error) => void;

    constructor({url, title, info, onStart, onFinish, onError, volume = 50}) {
        this.url = url;
        this.title = title;
        this.info = info;
        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }

    public createAudioResource(): Promise<AudioResource<Track>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.url,
                {
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] },
            );

            if (!process.stdout) {
                reject(new Error("no stdout"));
                return;
            }
            
            const stream = process.stdout;

            const onError = (error: Error) => {
                if (process.killed) process.kill();
                stream.resume;
                reject(error);
            }

            process
				.once('spawn', () => {
					demuxProbe(stream)
						.then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type, inlineVolume: true })))
						.catch(onError);
				})
				.catch(onError);
        });
    }

    public static async from (url: string, methods: Pick<Track, "onStart" | "onFinish" | "onError">): Promise<Track> {
        const info = await getInfo(url);
        const wrappedMethods = {
            onStart() {
                wrappedMethods.onStart = noop;
                methods.onStart();
            },
            onFinish() {
                wrappedMethods.onFinish = noop;
                methods.onStart();
            },
            onError(error: Error) {
                wrappedMethods.onError = noop;
                methods.onError(error);
            }
        }

        return new Track({
            title: info.videoDetails.title,
            url,
            info: info,
            ...wrappedMethods
        })
    }

}