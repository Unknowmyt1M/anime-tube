/* ==========================================================================
   ANITUBE STREAMING ENGINE CENTRAL CONFIGURATION
   All media endpoints, HLS manifests, subtitle VTTs, servers, & defaults
   ========================================================================== */

const ANITUBE_STREAM_CONFIG = {
  // Default Player Settings
  defaults: {
    autoplay: true,
    quality: 'auto',
    subtitle: 'en',
    audio: 'sub',
    source: 'fast',
    playbackRate: 1.0,
    volume: 1.0,
    muted: false
  },

  // Streaming Servers / Sources Configuration (CLEAN WATERMARK-FREE STREAMS)
  servers: [
    {
      id: 'fast',
      name: 'AniTube Ultra Fast (Sintel 1080p HLS - Clean Stream)',
      badge: 'RECOMMENDED',
      type: 'hls',
      hlsUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
    },
    {
      id: 'hd',
      name: 'AniTube HD Server (Akamai 1080p Multi-Bitrate HLS)',
      badge: '1080P HD',
      type: 'hls',
      hlsUrl: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    },
    {
      id: 'cloud_dl',
      name: 'Cloud Direct DL Proxy Server',
      badge: 'PROXY STREAM',
      type: 'mp4',
      mp4Url: 'http://localhost:5005/stream?url=https%3A%2F%2Fgdmirrorbot.nl%2Fclouddl%3Ffid%3D5d00b433de84%26exp%3D1784974559%26tkn%3Da176176e23bcc654084b524cc7644d71a58ee0c41eb9ac5b87123361b0dcadcf'
    },
    {
      id: 'backup',
      name: 'Backup Direct Stream (Anime City MP4)',
      badge: 'DIRECT',
      type: 'mp4',
      mp4Url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    }
  ],

  // Failover Sequence
  failoverOrder: ['fast', 'hd', 'backup', 'cloud_dl'],

  // Subtitle Language Tracks (WebVTT Demo Endpoints)
  subtitles: [
    { id: 'off', label: 'Off', srclang: '', src: '' },
    { id: 'en', label: 'English [CC]', srclang: 'en', default: true, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube Subtitles]: Sung Jinwoo - "Arise!"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0AWelcome to AniTube Production Engine!' },
    { id: 'hi', label: 'Hindi (हिंदी)', srclang: 'hi', default: false, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube हिंदी Subtitles]: संग जिनवू - "उठो!"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0Aअनिट्यूब प्रोडक्शन इंजन में आपका स्वागत है!' },
    { id: 'ja', label: 'Japanese (日本語)', srclang: 'ja', default: false, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube 日本語 Subtitles]: 水篠旬 - "起きろ！"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0AAniTubeへようこそ！' }
  ],

  // Audio Language Tracks
  audioTracks: [
    { id: 'sub', label: 'Japanese (Original with Subtitles)', language: 'ja' },
    { id: 'dub_en', label: 'English Dub', language: 'en' },
    { id: 'dub_hi', label: 'Hindi Dub', language: 'hi' }
  ]
};

// Expose configuration globally
window.CONFIG = ANITUBE_STREAM_CONFIG;
