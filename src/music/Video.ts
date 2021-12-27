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
          publishTime: string
      }
  }>
}

interface YoutubeThumbnail {
  url: string,
  width: number,
  height: number
}

export class Video {

  public title: string;
  public id: any;
  public desc: string;
  public data: YoutubeApi;

  constructor(data: YoutubeApi) {
    this.title = data.items[0].snippet.title;
    this.id = data.items[0].id;
    this.desc = data.items[0].snippet.description;
    this.data = data;
  }

get url() {
  return `https://www.youtube.com/watch?v=${this.id}`;
}

get thumbnail() {
  return `https://img.youtube.com/vi/${this.id}/default.jpg`;
}
}