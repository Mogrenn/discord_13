import get from "axios";
import { Video } from "./Video";
import * as url from "url";

interface YoutubeApi {
    kind: string,
    etag: string,
    nextPageToken: string,
    regionCode: string,
    pageInfo: {
        totalResults: number,
        resultsPerPage: number
    },
    items: ReadonlyArray<{
        kind: string,
        etag: string,
        id: {
            kind: string,
            videoId: string,
        },
        snippet: {
            publishedAt: string,
            channelId: string,
            title: string,
            description: string,
            thumbnails: {
                default: YoutubeThumbnail,
                medium: YoutubeThumbnail,
                high: YoutubeThumbnail
            },
            channelTitle: string,
            liveBroadcastContent: string,
            publishTime: string,
            videoOwnerChannelTitle: string,
            videoOwnerChannelId: string,
            playlistId: string,
            position: number,
            resourceId: {
                kind: string,
                videoId: string,
            },
        }
    }>
}

interface YoutubeThumbnail {
    url: string,
    width: number,
    height: number
}

interface YoutubePlaylistApi extends YoutubeApi {
    contentDetails: {
        videoId: string,
        startAt: string,
        endAt: string,
        note: string,
        videoPublishedAt: string
    },
    status: {
        privacyStatus: string
    }
}

export class Youtube {

    private key: string;
    private baseUrl: string;

    constructor(apiKey: string) {
        this.key = apiKey;
        this.baseUrl = "https://youtube.googleapis.com/youtube/v3/";
    }

    async GetVideoByID(id: string) {
		const part = "contentDetails,snippet";
        try {
            const res = await get(`${this.baseUrl}videos`, {
                params: {
                    part: part,
                    key: this.key,
                    id: id
                }
            });
            return new Video(res.data as YoutubeApi);
        } catch(e) {
            throw new Error("Could not fetch video");
        }
    }

    async GetVideo(link: string) {
        const parsed = url.parse(link, true);
		const id = parsed.query.v as string;
		if (!!id && this.TestID(id)) return await this.GetVideoByID(id);
		else throw new Error("Cannot resolve video ID");
    }

    async SearchVideo(q: string) {
        const parts = "snippet";
        const maxResults = 1;
        const category = 10;

        try {
            const res = await get(`${this.baseUrl}search`, {
                params: {
                    key: this.key,
                    maxResults: maxResults,
                    part: parts,
                    videoCategoryId: category,
                    q: q,
                    type: "video"
                }
            });
            return await this.GetVideoByID((res.data as YoutubeApi).items[0].id.videoId);
        } catch(e) {
            console.log(e);
            throw new Error("Cannot find video");
        }
    }

    async GetPlaylistByID(id: string) {
        const max = 25;
        const part = "snippet";
        let videos: Array<Video | null>;
        try {
            const res = await get(`${this.baseUrl}playlistItems`, {
                params: {
                    part: part,
                    key: this.key,
                    playlistId: id,
                    maxResults: max
                }
            });
            
            videos = await Promise.all((res.data as YoutubePlaylistApi).items.map(async item => {
                try {
                    return await this.GetVideoByID(item.snippet.resourceId.videoId);
                } catch(e) {
                    return null;
                }
            }));
        } catch(e) {
            throw new Error("Cannot find playlist");
        }
        return videos.filter(v => !!v);
    }

    async GetPlayList(link: string) {
        const parsed = url.parse(link, true);
		const id = parsed.query.list as string;
		if (!!id && this.TestID(id)) return await this.GetPlaylistByID(id);
		else throw new Error("Cannot resolve playlist ID");
    }

    TestID(id: string) {
		return /[A-Za-z0-9_-]+/.test(id);
	}
}