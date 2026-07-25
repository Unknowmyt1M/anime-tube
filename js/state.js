/* ==========================================================================
   ANITUBE STATE MANAGEMENT ENGINE
   LocalStorage Persistence: Unlimited Watch History, Progress, Player Preferences, Analytics
   ========================================================================== */

const ANITUBE_STATE = {
  // Current active player state
  currentShow: null,
  currentEpisode: null,
  currentSource: 'fast',
  currentQuality: 'auto',
  currentSubtitle: 'en',
  currentAudio: 'sub',
  autoplayEnabled: true,

  // Unlimited Watch History
  history: [],

  // Watch Progress Map: { [animeId_epId]: { position, duration, timestamp } }
  watchProgress: {},

  // User Settings
  settings: {
    autoplay: true,
    quality: 'auto',
    subtitle: 'en',
    audio: 'sub',
    source: 'fast',
    volume: 1.0,
    muted: false,
    playbackRate: 1.0
  },

  // Analytics Event Queue Buffer
  analyticsQueue: [],

  // --- INITIALIZATION & LOCALSTORAGE SYNC ---
  init() {
    try {
      const savedHistory = localStorage.getItem('anitube_history');
      if (savedHistory) this.history = JSON.parse(savedHistory);

      const savedProgress = localStorage.getItem('anitube_watch_progress');
      if (savedProgress) this.watchProgress = JSON.parse(savedProgress);

      const savedSettings = localStorage.getItem('anitube_player_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        this.autoplayEnabled = this.settings.autoplay;
        this.currentQuality = this.settings.quality;
        this.currentSubtitle = this.settings.subtitle;
        this.currentAudio = this.settings.audio;
        this.currentSource = this.settings.source;
      }
    } catch (e) {
      console.warn('AniTube State Init Error:', e);
    }
  },

  // Save Progress for Anime Episode
  saveProgress(animeId, epNum, position, duration) {
    if (!animeId || !epNum) return;
    const key = `${animeId}_ep${epNum}`;
    this.watchProgress[key] = {
      animeId,
      episode: epNum,
      position: Math.floor(position),
      duration: Math.floor(duration),
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('anitube_watch_progress', JSON.stringify(this.watchProgress));
    } catch (e) {}
  },

  // Get Saved Progress for Anime Episode
  getProgress(animeId, epNum) {
    const key = `${animeId}_ep${epNum}`;
    return this.watchProgress[key] || null;
  },

  // Log to Unlimited Watch History
  addToHistory(show, episode, position = 0, duration = 0) {
    if (!show || !episode) return;

    const item = {
      animeId: show.id,
      animeTitle: show.title,
      episodeId: episode.id,
      episodeNum: episode.number,
      episodeTitle: episode.title,
      thumbnail: episode.thumbnail || show.banner,
      position: Math.floor(position),
      duration: Math.floor(duration),
      lastWatched: Date.now()
    };

    // Filter out previous entry for same episode if exists
    this.history = this.history.filter(h => !(h.animeId === show.id && h.episodeNum === episode.number));

    // Unshift to top (Unlimited retention per user preference)
    this.history.unshift(item);

    try {
      localStorage.setItem('anitube_history', JSON.stringify(this.history));
    } catch (e) {}
  },

  // Save Player Settings
  saveSetting(key, val) {
    this.settings[key] = val;
    if (key === 'autoplay') this.autoplayEnabled = val;
    if (key === 'quality') this.currentQuality = val;
    if (key === 'subtitle') this.currentSubtitle = val;
    if (key === 'audio') this.currentAudio = val;
    if (key === 'source') this.currentSource = val;

    try {
      localStorage.setItem('anitube_player_settings', JSON.stringify(this.settings));
    } catch (e) {}
  }
};

// Analytics Event Logger Component
const AniTubeAnalytics = {
  logEvent(eventName, payload = {}) {
    const eventObj = {
      event: eventName,
      timestamp: new Date().toISOString(),
      payload
    };
    ANITUBE_STATE.analyticsQueue.push(eventObj);
    if (ANITUBE_STATE.analyticsQueue.length > 200) {
      ANITUBE_STATE.analyticsQueue.shift();
    }
    try {
      localStorage.setItem('anitube_analytics_log', JSON.stringify(ANITUBE_STATE.analyticsQueue));
    } catch (e) {}
  }
};

ANITUBE_STATE.init();
window.ANITUBE_STATE = ANITUBE_STATE;
window.AniTubeAnalytics = AniTubeAnalytics;
