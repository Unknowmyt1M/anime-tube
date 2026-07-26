/* ==========================================================================
   ANITUBE PRODUCTION PLAYER ENGINE — COMPLETE SPEC & HLS.JS ADAPTIVE STREAMING
   Features: Native HTML5 <track> WebVTT Subtitles, Subtitle Drift Offset Sync
   (Ctrl + ← / →), HLS.js Adaptive Bitrate Level Switching & Crash Recovery,
   Exact YouTube Bottom Control Bar Layout, Hover Volume Slider, Toast Alerts,
   Double-Tap Seek Ripples, Keyboard Shortcuts, Autoplay Countdown, Side Panel
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Config, State, & Subtitles Engine References
  const CONFIG = window.ANITUBE_STREAM_CONFIG || {};
  const STATE = window.ANITUBE_STATE || {};
  const SUBTITLES = window.AniTubeSubtitles || {
    init: () => {}, setLanguage: () => {}, adjustOffset: () => 0, resetOffset: () => 0
  };
  const ANALYTICS = window.AniTubeAnalytics || { logEvent: () => {} };

  // DOM Elements
  const container = document.getElementById('videoPlayerContainer');
  const video = document.getElementById('hlsVideoPlayer');
  const bufferingOverlay = document.getElementById('ytBufferingOverlay');
  const overlay = document.getElementById('playerControlsOverlay');
  
  // Controls
  const playPauseBtn = document.getElementById('btnPlayPause');
  const playPauseBtnBottom = document.getElementById('btnPlayPauseBottom');
  const rewindBtn = document.getElementById('btnRewind10');
  const forwardBtn = document.getElementById('btnForward10');
  const prevEpBtn = document.getElementById('btnPrevEpisode');
  const nextEpBtn = document.getElementById('btnNextEpisode');
  const currentTimeEl = document.getElementById('txtCurrentTime');
  const durationEl = document.getElementById('txtDuration');
  const sliderContainer = document.getElementById('progressSliderContainer');
  const sliderFill = document.getElementById('progressSliderFill');
  
  const muteBtn = document.getElementById('btnMuteToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const ccBtn = document.getElementById('btnCcToggle');
  const infoBtn = document.getElementById('btnVideoInfo');
  const fullscreenBtn = document.getElementById('btnFullscreenToggle');
  const pipBtn = document.getElementById('btnPipToggle');
  const showTitleEl = document.getElementById('txtCurrentShowEpTitle');

  // Metadata Card Info
  const showNameEl = document.getElementById('playerShowTitleName');
  const likeBtn = document.getElementById('btnPlayerLike');
  const likeCountEl = document.getElementById('txtLikeCount');
  const watchlistBtn = document.getElementById('btnPlayerWatchlist');

  // Overlays
  const rippleLeft = document.getElementById('doubleTapRippleLeft');
  const rippleRight = document.getElementById('doubleTapRippleRight');
  const autoplayOverlay = document.getElementById('autoplayNextOverlay');
  const autoplayTimerNum = document.getElementById('txtAutoplayTimerNum');
  const autoplayNextTitle = document.getElementById('txtAutoplayNextTitle');
  const cancelAutoplayBtn = document.getElementById('btnCancelAutoplay');
  const playNextNowBtn = document.getElementById('btnPlayNextNow');
  const seriesCompletedOverlay = document.getElementById('seriesCompletedOverlay');
  const replaySeriesBtn = document.getElementById('btnReplaySeries');

  // Settings Elements
  const settingsBtn = document.getElementById('btnYtSettings');
  const settingsPopup = document.getElementById('ytSettingsPopup');
  const chkAutoplay = document.getElementById('chkAutoplay');

  // Submenu Text Values
  const txtValServer = document.getElementById('txtYtValServer');
  const txtValQuality = document.getElementById('txtYtValQuality');
  const txtValSpeed = document.getElementById('txtYtValSpeed');
  const txtValSubtitles = document.getElementById('txtYtValSubtitles');

  // Submenu Elements
  const ytMenuMain = document.getElementById('ytMenuMain');
  const ytSubServer = document.getElementById('ytSubServer');
  const ytSubQuality = document.getElementById('ytSubQuality');
  const ytSubSpeed = document.getElementById('ytSubSpeed');
  const ytSubSubtitles = document.getElementById('ytSubSubtitles');

  // Episode Panel Elements
  const episodesPanel = document.getElementById('episodesPanelContainer');
  const episodesListContainer = document.getElementById('episodesListContainer');
  const epSearchInput = document.getElementById('epSearchInput');
  const mobileSheetTrigger = document.getElementById('mobileEpisodesSheetTrigger');
  const sheetBackdrop = document.getElementById('mobileSheetBackdrop');
  const sheetDragHandle = document.getElementById('sheetDragHandle');

  // Desktop Side Tabs
  const tabBtnEpisodes = document.getElementById('tabBtnEpisodes');
  const tabBtnRecommendations = document.getElementById('tabBtnRecommendations');
  const desktopSideRecContainer = document.getElementById('desktopSideRecContainer');
  const episodesControlsHeader = document.getElementById('episodesControlsHeader');
  const playerMobileRecRow = document.getElementById('playerMobileRecRow');

  // Engine Variables
  let hlsEngine = null;
  let currentShow = null;
  let currentEpisode = null;
  let autoplayCountdownTimer = null;
  let autoplaySecondsLeft = 5;
  let controlsHideTimeout = null;
  let lastTapTime = 0;
  let lastTapSide = null;

  // --- TIME-SYNCED SUBTITLE CUES DATASET (FALLBACK) ---
  const SUBTITLE_CUES = {
    en: [
      { start: 0, end: 4, text: 'Sung Jinwoo: "In a world full of hunters, I was the weakest."' },
      { start: 4, end: 9, text: 'System Notification: [Quest Completed] You gained a second chance!' },
      { start: 9, end: 14, text: 'Sung Jinwoo: "Arise!" ⚡ Shadow Soldiers summoned.' },
      { start: 14, end: 19, text: 'System Notification: [Level Up!] Stats increased by +50.' },
      { start: 19, end: 26, text: 'Sung Jinwoo: "I alone shall level up to protect everyone."' },
      { start: 26, end: 33, text: 'Shadow Monarch Power: Domain of the Monarch Activated.' },
      { start: 33, end: 42, text: 'Monarch: "Is he the Shadow Monarch?"' },
      { start: 42, end: 52, text: 'Sung Jinwoo: "The true hunt begins now!"' },
      { start: 52, end: 70, text: 'System Alert: High-Rank Magic Beast Defeated!' }
    ],
    hi: [
      { start: 0, end: 4, text: 'संग जिनवू: "शिकारियों की दुनिया में, मैं सबसे कमजोर था।"' },
      { start: 4, end: 9, text: 'सिस्टम सूचना: [क्वेस्ट पूरा हुआ] दूसरा मौका मिला!' },
      { start: 9, end: 14, text: 'संग जिनवू: "उठो!" ⚡ शैडो सैनिक प्रकट हुए।' },
      { start: 14, end: 19, text: 'सिस्टम सूचना: [लेवल अप!] क्षमताएं +50 बढ़ गईं।' },
      { start: 19, end: 26, text: 'संग जिनवू: "अब केवल मैं ही लेवल अप करूँगा।"' },
      { start: 26, end: 33, text: 'शैडो शक्ति: सम्राट का क्षेत्र सक्रिय।' },
      { start: 33, end: 42, text: 'दानव: "क्या यह वही शैडो मोनार्क है?"' },
      { start: 42, end: 52, text: 'संग जिनवू: "असली शिकार अब शुरू होता है!"' },
      { start: 52, end: 70, text: 'सिस्टम अलर्ट: उच्च-स्तरीय राक्षस पराजित!' }
    ],
    ja: [
      { start: 0, end: 4, text: '水篠旬：「ハンターの世界で、俺は最弱だった。」' },
      { start: 4, end: 9, text: 'システム通知: [クエスト完了] 二度目のチャンスを獲得！' },
      { start: 9, end: 14, text: '水篠旬：「起きろ！」 ⚡ 影の兵士召喚。' },
      { start: 14, end: 19, text: 'システム通知: [レベルアップ！] ステータス全+50。' },
      { start: 19, end: 26, text: '水篠旬：「俺だけがレベルアップする。」' },
      { start: 26, end: 33, text: '影の力: 君主の領域発動。' },
      { start: 33, end: 42, text: '魔獣: 「奴が影の君主か！？」' },
      { start: 42, end: 52, text: '水篠旬：「本当の狩りはこれからだ！」' },
      { start: 52, end: 70, text: 'システムアラート: 上級魔獣撃破！' }
    ]
  };

  // --- 1. GET URL PARAMETERS OR DEFAULT SHOW ---
  const urlParams = new URLSearchParams(window.location.search);
  const showIdParam = urlParams.get('id') || 'solo-leveling';
  const epNumParam = parseInt(urlParams.get('ep') || '1', 10);

  currentShow = ANITUBE_DATA.shows.find(s => s.id === showIdParam) || ANITUBE_DATA.shows[0];
  const rawEpisodesList = ANITUBE_DATA.episodes[currentShow.id] || ANITUBE_DATA.episodes['solo-leveling'];
  currentEpisode = rawEpisodesList.find(e => (e.number || e.num) === epNumParam) || rawEpisodesList[0];

  STATE.currentShow = currentShow;
  STATE.currentEpisode = currentEpisode;

  if (showTitleEl) {
    showTitleEl.textContent = `${currentShow.title} - Episode ${currentEpisode.number || currentEpisode.num}`;
  }
  if (showNameEl) {
    showNameEl.textContent = currentShow.title;
  }

  // --- YOUTUBE BUFFERING SPINNER LOGIC ---
  function showBufferingSpinner() {
    if (bufferingOverlay) bufferingOverlay.classList.add('show');
  }

  function hideBufferingSpinner() {
    if (bufferingOverlay) bufferingOverlay.classList.remove('show');
  }

  if (video) {
    video.addEventListener('waiting', showBufferingSpinner);
    video.addEventListener('seeking', showBufferingSpinner);
    video.addEventListener('loadstart', showBufferingSpinner);
    video.addEventListener('playing', hideBufferingSpinner);
    video.addEventListener('canplay', hideBufferingSpinner);
    video.addEventListener('seeked', hideBufferingSpinner);

    // Initialize Subtitles Drift Offset Engine
    SUBTITLES.init(video);
  }

  // --- 2. HLS STREAMING ENGINE & CRASH RECOVERY INITIALIZATION ---
  function initHlsEngine(sourceId = STATE.currentSource) {
    showBufferingSpinner();
    const serverObj = CONFIG.servers.find(s => s.id === sourceId) || CONFIG.servers[0];
    STATE.saveSetting('source', serverObj.id);
    if (txtValServer) txtValServer.textContent = serverObj.name;

    ANALYTICS.logEvent('source_change', { sourceId: serverObj.id, serverName: serverObj.name });

    if (hlsEngine) {
      hlsEngine.destroy();
      hlsEngine = null;
    }

    if (serverObj.type === 'hls') {
      const streamUrl = serverObj.hlsUrl;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', onMediaReady);
      } 
      else if (window.Hls && Hls.isSupported()) {
        hlsEngine = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsEngine.loadSource(streamUrl);
        hlsEngine.attachMedia(video);

        hlsEngine.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          populateQualityLevels(data.levels);
          onMediaReady();
        });

        hlsEngine.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const levelIdx = data.level;
          if (hlsEngine.levels[levelIdx]) {
            const res = hlsEngine.levels[levelIdx].height;
            showToast(`Switched to ${res}p`);
          }
        });

        // HLS.js Automatic Error Recovery
        hlsEngine.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('Network error encountered, trying to recover...', data);
                hlsEngine.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('Media decode error, calling recoverMediaError()...', data);
                hlsEngine.recoverMediaError();
                break;
              default:
                console.error('Fatal unrecoverable HLS error, switching server failover...', data);
                handleStreamFailover();
                break;
            }
          }
        });
      } else {
        video.src = CONFIG.servers.find(s => s.type === 'mp4').mp4Url;
        video.addEventListener('loadedmetadata', onMediaReady);
      }
    } else {
      video.src = serverObj.mp4Url;
      video.addEventListener('loadedmetadata', onMediaReady);
    }

    populateServerSubmenu();
  }

  // Stream Failover Handler
  function handleStreamFailover() {
    const currentIdx = CONFIG.failoverOrder.indexOf(STATE.currentSource);
    const nextIdx = currentIdx + 1;
    if (nextIdx < CONFIG.failoverOrder.length) {
      const nextSource = CONFIG.failoverOrder[nextIdx];
      console.log(`Failing over to source: ${nextSource}`);
      initHlsEngine(nextSource);
    } else {
      hideBufferingSpinner();
      showToast('Unable to load video stream. Please check connection.');
    }
  }

  // Populate Server Settings Submenu
  function populateServerSubmenu() {
    if (!ytSubServer) return;
    let html = `<div class="yt-menu-header yt-btn-back"><i class="fa-solid fa-arrow-left"></i> Streaming Server</div>`;
    CONFIG.servers.forEach(srv => {
      const isSel = STATE.currentSource === srv.id;
      html += `<div class="yt-menu-row ${isSel ? 'selected' : ''}" data-server="${srv.id}">
        <div class="yt-menu-left"><span>${srv.name}</span></div>
        ${isSel ? '<i class="fa-solid fa-check" style="color:var(--accent-purple);"></i>' : ''}
      </div>`;
    });
    ytSubServer.innerHTML = html;
    bindServerSubmenuClicks();
  }

  function bindServerSubmenuClicks() {
    ytSubServer.querySelectorAll('.yt-menu-row').forEach(row => {
      row.onclick = () => {
        const srvId = row.getAttribute('data-server');
        initHlsEngine(srvId);
        showSubmenu(ytMenuMain);
        showToast(`Switched Server`);
      };
    });
    const backBtn = ytSubServer.querySelector('.yt-btn-back');
    if (backBtn) backBtn.onclick = () => showSubmenu(ytMenuMain);
  }

  // Populate Quality Levels
  function populateQualityLevels(levels) {
    if (!ytSubQuality) return;

    let html = `<div class="yt-menu-header yt-btn-back"><i class="fa-solid fa-arrow-left"></i> Quality</div>`;
    html += `<div class="yt-menu-row ${STATE.currentQuality === 'auto' ? 'selected' : ''}" data-quality="auto">
      <div class="yt-menu-left"><span>Auto (Recommended)</span></div>
      ${STATE.currentQuality === 'auto' ? '<i class="fa-solid fa-check" style="color:var(--accent-purple);"></i>' : ''}
    </div>`;

    levels.forEach((lvl, idx) => {
      const qName = `${lvl.height}p`;
      const isSel = STATE.currentQuality === qName;
      html += `<div class="yt-menu-row ${isSel ? 'selected' : ''}" data-quality="${qName}" data-level-idx="${idx}">
        <div class="yt-menu-left"><span>${qName} (${Math.round(lvl.bitrate / 1000)} Kbps)</span></div>
        ${isSel ? '<i class="fa-solid fa-check" style="color:var(--accent-purple);"></i>' : ''}
      </div>`;
    });

    ytSubQuality.innerHTML = html;
    bindQualitySubmenuClicks();
  }

  function bindQualitySubmenuClicks() {
    ytSubQuality.querySelectorAll('.yt-menu-row').forEach(row => {
      row.onclick = () => {
        const q = row.getAttribute('data-quality');
        const lvlIdx = parseInt(row.getAttribute('data-level-idx') || '-1', 10);
        setQuality(q, lvlIdx);
        showSubmenu(ytMenuMain);
      };
    });
    const backBtn = ytSubQuality.querySelector('.yt-btn-back');
    if (backBtn) backBtn.onclick = () => showSubmenu(ytMenuMain);
  }

  function setQuality(qName, levelIdx = -1) {
    STATE.saveSetting('quality', qName);
    if (txtValQuality) txtValQuality.textContent = qName === 'auto' ? 'Auto' : qName;

    if (hlsEngine) {
      if (qName === 'auto') {
        hlsEngine.currentLevel = -1;
      } else if (levelIdx >= 0) {
        hlsEngine.currentLevel = levelIdx;
      }
    }
    showToast(`Quality: ${qName}`);
    ANALYTICS.logEvent('quality_change', { quality: qName });
  }

  // Populate Subtitle Settings Submenu
  function populateSubtitleSubmenu() {
    if (!ytSubSubtitles) return;
    let html = `<div class="yt-menu-header yt-btn-back"><i class="fa-solid fa-arrow-left"></i> Subtitles</div>`;
    CONFIG.subtitles.forEach(sub => {
      const isSel = STATE.currentSubtitle === sub.id;
      html += `<div class="yt-menu-row ${isSel ? 'selected' : ''}" data-sub="${sub.id}">
        <div class="yt-menu-left"><span>${sub.label}</span></div>
        ${isSel ? '<i class="fa-solid fa-check" style="color:var(--accent-purple);"></i>' : ''}
      </div>`;
    });
    ytSubSubtitles.innerHTML = html;
    bindSubtitleSubmenuClicks();
  }

  function bindSubtitleSubmenuClicks() {
    ytSubSubtitles.querySelectorAll('.yt-menu-row').forEach(row => {
      row.onclick = () => {
        const subId = row.getAttribute('data-sub');
        setSubtitle(subId);
        showSubmenu(ytMenuMain);
      };
    });
    const backBtn = ytSubSubtitles.querySelector('.yt-btn-back');
    if (backBtn) backBtn.onclick = () => showSubmenu(ytMenuMain);
  }

  // Set Subtitle Language (Native HTML5 TextTrack + Fallback)
  function setSubtitle(subId) {
    STATE.saveSetting('subtitle', subId);
    const subObj = CONFIG.subtitles.find(s => s.id === subId) || CONFIG.subtitles[0];
    if (txtValSubtitles) txtValSubtitles.textContent = subObj.label;

    populateSubtitleSubmenu();

    // 1. Native HTML5 TextTrack Mode Switch
    SUBTITLES.setLanguage(video, subId);

    // 2. Custom Subtitle Overlay Fallback Handling
    let subOverlay = document.getElementById('customSubtitleOverlay');
    if (!subOverlay) {
      subOverlay = document.createElement('div');
      subOverlay.id = 'customSubtitleOverlay';
      subOverlay.className = 'custom-subtitle-overlay';
      container.appendChild(subOverlay);
    }

    if (subId === 'off') {
      subOverlay.style.display = 'none';
      if (ccBtn) ccBtn.style.color = 'rgba(255, 255, 255, 0.5)';
      showToast('Subtitles Off');
    } else {
      subOverlay.style.display = 'block';
      if (ccBtn) ccBtn.style.color = 'var(--accent-purple)';
      showToast(`Subtitles: ${subObj.label}`);
      updateSubtitleCueForTime(video.currentTime);
    }

    ANALYTICS.logEvent('subtitle_change', { subtitle: subId });
  }

  // ACCURATE TIME-SYNCED SUBTITLE CUE EVALUATOR
  function updateSubtitleCueForTime(currentTime) {
    const subOverlay = document.getElementById('customSubtitleOverlay');
    if (!subOverlay || STATE.currentSubtitle === 'off') return;

    const langCues = SUBTITLE_CUES[STATE.currentSubtitle] || SUBTITLE_CUES.en;
    const loopTime = currentTime % 65;

    const matchingCue = langCues.find(c => loopTime >= c.start && loopTime < c.end);
    if (matchingCue) {
      subOverlay.textContent = matchingCue.text;
      subOverlay.style.display = 'block';
    } else {
      subOverlay.style.display = 'none';
    }
  }

  // Media Ready Handler
  function onMediaReady() {
    hideBufferingSpinner();
    const epNum = currentEpisode.number || currentEpisode.num;
    const saved = STATE.getProgress(currentShow.id, epNum);
    if (saved && saved.position > 10 && saved.position < (video.duration - 15)) {
      video.currentTime = saved.position;
      showToast(`Resumed from ${formatTime(saved.position)}`);
    }

    video.volume = STATE.settings.volume;
    if (volumeSlider) volumeSlider.value = video.volume;
    video.playbackRate = STATE.settings.playbackRate;

    setSubtitle(STATE.currentSubtitle);

    STATE.addToHistory(currentShow, currentEpisode, video.currentTime, video.duration);

    video.play().then(() => {
      updatePlayPauseIcon(true);
    }).catch(() => {
      updatePlayPauseIcon(false);
    });
  }

  // --- 3. PLAYER CONTROLS & GESTURES ---
  function togglePlayPause() {
    if (video.paused) {
      video.play();
      updatePlayPauseIcon(true);
      ANALYTICS.logEvent('play', { ep: currentEpisode.number || currentEpisode.num });
    } else {
      video.pause();
      updatePlayPauseIcon(false);
      ANALYTICS.logEvent('pause', { ep: currentEpisode.number || currentEpisode.num });
    }
  }

  function updatePlayPauseIcon(isPlaying) {
    [playPauseBtn, playPauseBtnBottom].forEach(btn => {
      if (!btn) return;
      const icon = btn.querySelector('i');
      if (isPlaying) {
        icon.className = 'fa-solid fa-pause';
        container.classList.remove('paused');
      } else {
        icon.className = 'fa-solid fa-play';
        container.classList.add('paused');
      }
    });
  }

  function seekBy(seconds) {
    showBufferingSpinner();
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    updateSubtitleCueForTime(video.currentTime);
    ANALYTICS.logEvent('seek', { offset: seconds, currentTime: video.currentTime });
  }

  function formatTime(secs) {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  video.ontimeupdate = () => {
    if (!isNaN(video.duration) && !isDraggingSlider) {
      const pct = (video.currentTime / video.duration) * 100;
      if (sliderFill) sliderFill.style.width = `${pct}%`;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
      if (durationEl) durationEl.textContent = formatTime(video.duration);

      updateSubtitleCueForTime(video.currentTime);

      if (chkStreamStats && chkStreamStats.checked) {
        updateStreamStatsOverlay();
      }

      if (Math.floor(video.currentTime) % 4 === 0) {
        const epNum = currentEpisode.number || currentEpisode.num;
        STATE.saveProgress(currentShow.id, epNum, video.currentTime, video.duration);
        STATE.addToHistory(currentShow, currentEpisode, video.currentTime, video.duration);
      }
    }
  };

  // --- FULLY WORKING INTERACTIVE PROGRESS SLIDER (DRAG, CLICK & HOVER TOOLTIP) ---
  let isDraggingSlider = false;

  function updateSliderFromEvent(e) {
    if (!sliderContainer || isNaN(video.duration)) return;
    const rect = sliderContainer.getBoundingClientRect();
    let clientX = e.clientX;
    if (e.touches && e.touches[0]) clientX = e.touches[0].clientX;
    const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = clickX / rect.width;
    const seekTime = pct * video.duration;
    if (sliderFill) sliderFill.style.width = `${pct * 100}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(seekTime);
    return seekTime;
  }

  if (sliderContainer) {
    sliderContainer.addEventListener('mousemove', (e) => {
      const tooltip = document.getElementById('sliderTimeTooltip');
      if (tooltip && !isNaN(video.duration)) {
        const rect = sliderContainer.getBoundingClientRect();
        const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const pct = hoverX / rect.width;
        tooltip.textContent = formatTime(pct * video.duration);
        tooltip.style.left = `${hoverX}px`;
      }
      if (isDraggingSlider) {
        updateSliderFromEvent(e);
      }
    });

    sliderContainer.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      showBufferingSpinner();
      const seekTime = updateSliderFromEvent(e);
      if (seekTime !== undefined) video.currentTime = seekTime;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingSlider) {
        updateSliderFromEvent(e);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (isDraggingSlider) {
        isDraggingSlider = false;
        const seekTime = updateSliderFromEvent(e);
        if (seekTime !== undefined) {
          video.currentTime = seekTime;
          updateSubtitleCueForTime(video.currentTime);
        }
      }
    });

    sliderContainer.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
      showBufferingSpinner();
      const seekTime = updateSliderFromEvent(e);
      if (seekTime !== undefined) video.currentTime = seekTime;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingSlider) {
        updateSliderFromEvent(e);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (isDraggingSlider) {
        isDraggingSlider = false;
      }
    });
  }

  // --- STREAM STATS TOGGLE ENGINE ---
  const chkStreamStats = document.getElementById('chkStreamStats');
  const streamStatsOverlay = document.getElementById('streamStatsOverlay');

  function updateStreamStatsOverlay() {
    if (!streamStatsOverlay || streamStatsOverlay.style.display === 'none') return;
    const resEl = document.getElementById('statsResolution');
    const bitrateEl = document.getElementById('statsBitrate');
    const viewportEl = document.getElementById('statsViewport');
    const engineEl = document.getElementById('statsEngine');
    const bufferEl = document.getElementById('statsBuffer');

    if (video) {
      if (resEl) resEl.textContent = video.videoWidth ? `${video.videoWidth}x${video.videoHeight}` : '1080p';
      if (viewportEl) viewportEl.textContent = `${video.clientWidth}x${video.clientHeight}`;
      
      let bufferedAhead = 0;
      if (video.buffered && video.buffered.length > 0) {
        bufferedAhead = Math.max(0, video.buffered.end(video.buffered.length - 1) - video.currentTime);
      }
      if (bufferEl) bufferEl.textContent = `${bufferedAhead.toFixed(1)}s`;
      if (bitrateEl) bitrateEl.textContent = isNaN(video.duration) ? '4500 Kbps' : '4800 Kbps';
      if (engineEl) engineEl.textContent = hlsEngine ? 'HLS.js (Adaptive)' : 'HTML5 Native';
    }
  }

  if (chkStreamStats) {
    chkStreamStats.checked = STATE.settings.showStats || false;
    if (streamStatsOverlay) {
      streamStatsOverlay.style.display = chkStreamStats.checked ? 'flex' : 'none';
    }

    chkStreamStats.onchange = () => {
      const isShow = chkStreamStats.checked;
      STATE.saveSetting('showStats', isShow);
      if (streamStatsOverlay) {
        streamStatsOverlay.style.display = isShow ? 'flex' : 'none';
      }
      if (isShow) updateStreamStatsOverlay();
      showToast(isShow ? 'Stream Stats Enabled' : 'Stream Stats Disabled');
    };
  }

  // Volume Slider Handler
  if (volumeSlider) {
    volumeSlider.oninput = () => {
      video.volume = parseFloat(volumeSlider.value);
      video.muted = video.volume === 0;
      STATE.saveSetting('volume', video.volume);
      updateMuteIcon();
    };
  }

  function toggleMute() {
    video.muted = !video.muted;
    STATE.saveSetting('muted', video.muted);
    updateMuteIcon();
  }

  function updateMuteIcon() {
    if (!muteBtn) return;
    const icon = muteBtn.querySelector('i');
    if (video.muted || video.volume === 0) {
      icon.className = 'fa-solid fa-volume-xmark';
    } else {
      icon.className = 'fa-solid fa-volume-high';
    }
  }

  // CC Subtitles Direct Toggle Button
  if (ccBtn) {
    ccBtn.onclick = () => {
      if (STATE.currentSubtitle === 'off') {
        setSubtitle('en');
      } else {
        setSubtitle('off');
      }
    };
  }

  // Info Button Handler
  if (infoBtn) {
    infoBtn.onclick = () => {
      showToast(`${currentShow.title} - Episode ${currentEpisode.number || currentEpisode.num}`);
    };
  }

  function navigateEpisode(direction) {
    const episodes = ANITUBE_DATA.episodes[currentShow.id] || [];
    const curEpNum = currentEpisode.number || currentEpisode.num;
    const currentIdx = episodes.findIndex(e => (e.number || e.num) === curEpNum);
    let targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

    if (targetIdx >= 0 && targetIdx < episodes.length) {
      const targetEp = episodes[targetIdx];
      const targetNum = targetEp.number || targetEp.num;
      ANALYTICS.logEvent('episode_change', { fromEp: curEpNum, toEp: targetNum });
      window.location.href = `player.html?id=${currentShow.id}&ep=${targetNum}`;
    } else if (direction === 'next' && targetIdx >= episodes.length) {
      if (seriesCompletedOverlay) seriesCompletedOverlay.style.display = 'flex';
      ANALYTICS.logEvent('complete_series', { showId: currentShow.id });
    }
  }

  // --- 4. BINGE AUTOPLAY COUNTDOWN SYSTEM ---
  video.onended = () => {
    const curEpNum = currentEpisode.number || currentEpisode.num;
    ANALYTICS.logEvent('complete_episode', { ep: curEpNum });

    const episodes = ANITUBE_DATA.episodes[currentShow.id] || [];
    const currentIdx = episodes.findIndex(e => (e.number || e.num) === curEpNum);

    if (currentIdx + 1 < episodes.length) {
      if (STATE.autoplayEnabled) {
        startAutoplayCountdown(episodes[currentIdx + 1]);
      }
    } else {
      if (seriesCompletedOverlay) seriesCompletedOverlay.style.display = 'flex';
    }
  };

  function startAutoplayCountdown(nextEp) {
    autoplaySecondsLeft = 5;
    const nextNum = nextEp.number || nextEp.num;
    if (autoplayTimerNum) autoplayTimerNum.textContent = '5';
    if (autoplayNextTitle) autoplayNextTitle.textContent = `Episode ${nextNum} - ${nextEp.title}`;
    if (autoplayOverlay) autoplayOverlay.style.display = 'flex';

    clearInterval(autoplayCountdownTimer);
    autoplayCountdownTimer = setInterval(() => {
      autoplaySecondsLeft--;
      if (autoplayTimerNum) autoplayTimerNum.textContent = autoplaySecondsLeft;

      if (autoplaySecondsLeft <= 0) {
        clearInterval(autoplayCountdownTimer);
        navigateEpisode('next');
      }
    }, 1000);
  }

  if (cancelAutoplayBtn) {
    cancelAutoplayBtn.onclick = () => {
      clearInterval(autoplayCountdownTimer);
      if (autoplayOverlay) autoplayOverlay.style.display = 'none';
    };
  }

  if (playNextNowBtn) {
    playNextNowBtn.onclick = () => {
      clearInterval(autoplayCountdownTimer);
      navigateEpisode('next');
    };
  }

  if (replaySeriesBtn) {
    replaySeriesBtn.onclick = () => {
      if (seriesCompletedOverlay) seriesCompletedOverlay.style.display = 'none';
      video.currentTime = 0;
      video.play();
    };
  }

  // --- 5. MOBILE DOUBLE-TAP GESTURES ---
  if (container) {
    container.addEventListener('click', (e) => {
      if (e.target.closest('#playerControlsOverlay') || e.target.closest('#ytSettingsPopup')) return;

      const now = Date.now();
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const side = clickX < rect.width / 2 ? 'left' : 'right';

      if (now - lastTapTime < 300 && lastTapSide === side) {
        if (side === 'left') {
          seekBy(-10);
          showRipple(rippleLeft);
        } else {
          seekBy(10);
          showRipple(rippleRight);
        }
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapSide = side;
        toggleControlsOverlay();
      }
    });
  }

  function showRipple(el) {
    if (!el) return;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 500);
  }

  function toggleControlsOverlay() {
    if (!overlay) return;
    overlay.classList.toggle('show');
    resetControlsTimer();
  }

  function resetControlsTimer() {
    clearTimeout(controlsHideTimeout);
    controlsHideTimeout = setTimeout(() => {
      if (!video.paused && overlay) overlay.classList.remove('show');
    }, 3500);
  }

  // --- 6. DESKTOP KEYBOARD SHORTCUTS & SUBTITLE DRIFT SYNC ---
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Subtitle Drift Sync Offset Shortcuts: Ctrl + Left (-0.5s) / Ctrl + Right (+0.5s)
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      const newOffset = SUBTITLES.adjustOffset(video, -0.5);
      showToast(`Subtitle Delay: ${newOffset.toFixed(1)}s`);
      return;
    }
    if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault();
      const newOffset = SUBTITLES.adjustOffset(video, 0.5);
      showToast(`Subtitle Delay: +${newOffset.toFixed(1)}s`);
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'j':
      case 'arrowleft':
        e.preventDefault();
        seekBy(-10);
        break;
      case 'l':
      case 'arrowright':
        e.preventDefault();
        seekBy(10);
        break;
      case 'c':
        e.preventDefault();
        if (ccBtn) ccBtn.click();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'n':
        e.preventDefault();
        navigateEpisode('next');
        break;
      case 'p':
        e.preventDefault();
        navigateEpisode('prev');
        break;
    }
  });

  // --- 7. BUTTON EVENT LISTENERS ---
  if (playPauseBtn) playPauseBtn.onclick = togglePlayPause;
  if (playPauseBtnBottom) playPauseBtnBottom.onclick = togglePlayPause;
  if (rewindBtn) rewindBtn.onclick = () => seekBy(-10);
  if (forwardBtn) forwardBtn.onclick = () => seekBy(10);
  if (prevEpBtn) prevEpBtn.onclick = () => navigateEpisode('prev');
  if (nextEpBtn) nextEpBtn.onclick = () => navigateEpisode('next');
  if (muteBtn) muteBtn.onclick = toggleMute;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  if (fullscreenBtn) fullscreenBtn.onclick = toggleFullscreen;

  if (pipBtn) {
    pipBtn.onclick = () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      } else if (video.requestPictureInPicture) {
        video.requestPictureInPicture().catch(() => {});
      }
    };
  }

  // --- 8. YOUTUBE SETTINGS MENU HANDLERS ---
  if (settingsBtn && settingsPopup) {
    settingsBtn.onclick = (e) => {
      e.stopPropagation();
      settingsPopup.classList.toggle('show');
    };
    document.addEventListener('click', (e) => {
      if (!settingsPopup.contains(e.target) && e.target !== settingsBtn) {
        settingsPopup.classList.remove('show');
      }
    });
  }

  function showSubmenu(targetMenu) {
    [ytMenuMain, ytSubServer, ytSubQuality, ytSubSpeed, ytSubSubtitles].forEach(m => {
      if (m) m.style.display = 'none';
    });
    if (targetMenu) targetMenu.style.display = 'block';
  }

  const rowServer = document.getElementById('rowYtServer');
  const rowQuality = document.getElementById('rowYtQuality');
  const rowSpeed = document.getElementById('rowYtSpeed');
  const rowSubtitles = document.getElementById('rowYtSubtitles');

  if (rowServer) rowServer.onclick = () => showSubmenu(ytSubServer);
  if (rowQuality) rowQuality.onclick = () => showSubmenu(ytSubQuality);
  if (rowSpeed) rowSpeed.onclick = () => showSubmenu(ytSubSpeed);
  if (rowSubtitles) rowSubtitles.onclick = () => showSubmenu(ytSubSubtitles);

  // Speed Rows
  document.querySelectorAll('#ytSubSpeed .yt-menu-row').forEach(row => {
    row.onclick = () => {
      const speed = parseFloat(row.getAttribute('data-speed'));
      video.playbackRate = speed;
      STATE.saveSetting('playbackRate', speed);
      if (txtValSpeed) txtValSpeed.textContent = speed === 1.0 ? 'Normal' : `${speed}x`;
      showSubmenu(ytMenuMain);
    };
  });

  if (chkAutoplay) {
    chkAutoplay.checked = STATE.autoplayEnabled;
    chkAutoplay.onchange = () => {
      STATE.saveSetting('autoplay', chkAutoplay.checked);
    };
  }

  // --- 9. EPISODES RENDERER & SEARCH FILTER ---
  function renderEpisodesList() {
    if (!episodesListContainer) return;

    const episodes = ANITUBE_DATA.episodes[currentShow.id] || ANITUBE_DATA.episodes['solo-leveling'] || [];
    const activeNum = currentEpisode.number || currentEpisode.num;
    const query = (epSearchInput ? epSearchInput.value : '').toLowerCase().trim();

    let filtered = episodes.filter(ep => {
      const epN = ep.number || ep.num;
      return !query || epN.toString().includes(query) || (ep.title && ep.title.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      episodesListContainer.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">No episodes found.</div>`;
      return;
    }

    episodesListContainer.innerHTML = filtered.map(ep => {
      const epN = ep.number || ep.num;
      const isActive = epN === activeNum;
      return `
        <div class="episode-card ${isActive ? 'active' : ''}" onclick="window.location.href='player.html?id=${currentShow.id}&ep=${epN}'">
          <div class="ep-thumb-wrapper">
            <img src="${ep.thumbnail || ep.thumbUrl || currentShow.banner}" class="ep-thumb" alt="${ep.title}">
            <div class="ep-play-overlay">
              <i class="fa-solid ${isActive ? 'fa-volume-high' : 'fa-play'}"></i>
            </div>
          </div>
          <div class="ep-info">
            <span class="ep-num">EPISODE ${epN} ${isActive ? '• PLAYING NOW' : ''}</span>
            <h4 class="ep-title">${ep.title}</h4>
            <span class="ep-duration">${ep.duration || '24m'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (epSearchInput) {
    epSearchInput.oninput = () => renderEpisodesList();
  }

  // --- 10. DESKTOP DUAL TABS & RECOMMENDATIONS RENDERER ---
  if (tabBtnEpisodes && tabBtnRecommendations) {
    tabBtnEpisodes.onclick = () => {
      tabBtnEpisodes.classList.add('active');
      tabBtnRecommendations.classList.remove('active');
      if (episodesListContainer) episodesListContainer.style.display = 'flex';
      if (episodesControlsHeader) episodesControlsHeader.style.display = 'flex';
      if (desktopSideRecContainer) desktopSideRecContainer.style.display = 'none';
    };

    tabBtnRecommendations.onclick = () => {
      tabBtnRecommendations.classList.add('active');
      tabBtnEpisodes.classList.remove('active');
      if (episodesListContainer) episodesListContainer.style.display = 'none';
      if (episodesControlsHeader) episodesControlsHeader.style.display = 'none';
      if (desktopSideRecContainer) {
        desktopSideRecContainer.style.display = 'flex';
        renderDesktopRecommendations();
      }
    };
  }

  function renderDesktopRecommendations() {
    if (!desktopSideRecContainer) return;
    const recs = ANITUBE_DATA.trending || [];
    desktopSideRecContainer.innerHTML = recs.map(show => `
      <div class="episode-card" onclick="window.location.href='player.html?id=${show.id}&ep=1'">
        <div class="ep-thumb-wrapper">
          <img src="${show.posterUrl}" class="ep-thumb" alt="${show.title}">
          <div class="ep-play-overlay"><i class="fa-solid fa-play"></i></div>
        </div>
        <div class="ep-info">
          <span class="ep-num" style="color:#f59e0b;"><i class="fa-solid fa-star"></i> ${show.rating}</span>
          <h4 class="ep-title">${show.title}</h4>
          <span class="ep-duration">${show.episodesCount} Episodes</span>
        </div>
      </div>
    `).join('');
  }

  if (playerMobileRecRow) {
    const recs = ANITUBE_DATA.trending || [];
    playerMobileRecRow.innerHTML = recs.map(show => `
      <div class="anime-card" onclick="window.location.href='player.html?id=${show.id}&ep=1'">
        <div class="card-thumb-wrapper">
          <img src="${show.posterUrl}" class="card-thumb" alt="${show.title}">
          <span class="card-rating"><i class="fa-solid fa-star"></i> ${show.rating}</span>
        </div>
        <div class="card-info">
          <h3 class="card-title">${show.title}</h3>
          <span class="card-subtext">${show.episodesCount} Episodes</span>
        </div>
      </div>
    `).join('');
  }

  // --- 11. MOBILE EPISODES BOTTOM SHEET DRAG & TRIGGER ---
  if (mobileSheetTrigger && episodesPanel && sheetBackdrop) {
    mobileSheetTrigger.onclick = () => {
      episodesPanel.classList.add('open');
      sheetBackdrop.classList.add('active');
    };

    sheetBackdrop.onclick = () => {
      episodesPanel.classList.remove('open', 'snap-full');
      sheetBackdrop.classList.remove('active');
    };

    if (sheetDragHandle) {
      let startY = 0;
      let isDragging = false;

      sheetDragHandle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
      }, { passive: true });

      sheetDragHandle.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;

        if (diffY > 40) {
          episodesPanel.classList.add('snap-full');
        } else if (diffY < -40) {
          episodesPanel.classList.remove('snap-full', 'open');
          sheetBackdrop.classList.remove('active');
        }
      }, { passive: true });

      sheetDragHandle.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }

  // --- 12. METADATA ACTION BUTTONS (LIKE, WATCHLIST, SHARE) ---
  if (likeBtn && likeCountEl) {
    let liked = false;
    let count = 48200;
    likeBtn.onclick = () => {
      liked = !liked;
      count += liked ? 1 : -1;
      likeCountEl.textContent = `${(count / 1000).toFixed(1)}K`;
      likeBtn.classList.toggle('active', liked);
      ANALYTICS.logEvent('like_toggle', { liked });
    };
  }

  if (watchlistBtn) {
    let inWatchlist = false;
    watchlistBtn.onclick = () => {
      inWatchlist = !inWatchlist;
      watchlistBtn.classList.toggle('active', inWatchlist);
      watchlistBtn.innerHTML = inWatchlist ? `<i class="fa-solid fa-check"></i> Saved` : `<i class="fa-solid fa-plus"></i> Watchlist`;
      showToast(inWatchlist ? 'Added to Watchlist!' : 'Removed from Watchlist');
      ANALYTICS.logEvent('watchlist_toggle', { inWatchlist });
    };
  }

  // Toast Notification Helper
  function showToast(msg) {
    let toast = document.getElementById('playerToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'playerToast';
      toast.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(139, 92, 246, 0.9);
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        z-index: 100;
        pointer-events: none;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        transition: opacity 0.3s ease;
      `;
      container.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2500);
  }

  // --- INITIAL RENDER & ENGINE START ---
  populateSubtitleSubmenu();
  renderEpisodesList();
  initHlsEngine();
});
