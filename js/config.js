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
    source: 'cloud_dl',
    playbackRate: 1.0,
    volume: 1.0,
    muted: false
  },

  // Streaming Servers / Sources Configuration
  servers: [
    {
      id: 'cloud_dl',
      name: 'Cloud Direct DL (Solo Leveling 1080p - Auto Refreshed)',
      badge: 'PROXY STREAM',
      type: 'mp4',
      mp4Url: 'http://localhost:5005/stream?url=https%3A%2F%2Fgdmirrorbot.nl%2Fclouddl%3Ffid%3D5d00b433de84%26exp%3D1784974559%26tkn%3Da176176e23bcc654084b524cc7644d71a58ee0c41eb9ac5b87123361b0dcadcf'
    },
    {
      id: 'fast',
      name: 'Fast Server (HLS Multi-Bitrate)',
      badge: 'RECOMMENDED',
      type: 'hls',
      hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    },
    {
      id: 'hd',
      name: 'HD Server (Tears of Steel HLS)',
      badge: '1080P HD',
      type: 'hls',
      hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
    },
    {
      id: 'backup',
      name: 'Backup Server (Direct MP4 Stream)',
      badge: 'DIRECT',
      type: 'mp4',
      mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-anime-character-in-a-futuristic-city-41556-large.mp4'
    }
  ],

  // Failover Sequence
  failoverOrder: ['cloud_dl', 'fast', 'hd', 'backup'],

  // Subtitle Language Tracks (WebVTT Demo Endpoints)
  subtitles: [
    { id: 'off', label: 'Off', srclang: '', src: '' },
    { id: 'en', label: 'English [CC]', srclang: 'en', default: true, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube Subtitles]: Sung Jinwoo - "Arise!"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0AWelcome to AniTube Production Engine!' },
    { id: 'hi', label: 'Hindi (हिंदी)', srclang: 'hi', default: false, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube हिंदी Subtitles]: संग जिनवू - "उठो!"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0Aअनिट्यूब प्रोडक्शन इंजन में आपका स्वागत है!' },
    { id: 'ja', label: 'Japanese (日本語)', srclang: 'ja', default: false, src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:05.000%0A[AniTube 日本語 Subtitles]: 水篠旬 - "起きろ！"%0A%0A2%0A00:00:06.000%20-->%2000:00:10.000%0AAniTubeへようこそ！' }
  ],

  // Audio Tracks
  audioTracks: [
    { id: 'sub', label: 'Japanese (Original Sub)' },
    { id: 'dub_en', label: 'English Dub' },
    { id: 'dub_hi', label: 'Hindi Dub' }
  ]
};

window.ANITUBE_STREAM_CONFIG = ANITUBE_STREAM_CONFIG;
