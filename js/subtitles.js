/* ==========================================================================
   ANITUBE SUBTITLE & DRIFT OFFSET SYNCHRONIZATION ENGINE
   Native WebVTT TextTracks, Subtitle Language Toggle, and Timing Offset Sync
   ========================================================================== */

const AniTubeSubtitles = (function () {
  let activeOffsetSec = 0;
  let originalCuesMap = new Map();

  function init(videoElement) {
    if (!videoElement) return;

    // Load saved offset from LocalStorage
    const savedOffset = localStorage.getItem('anitube_subtitle_offset');
    if (savedOffset !== null) {
      activeOffsetSec = parseFloat(savedOffset) || 0;
    }

    // Attach Event Listener for TextTrack cues loading
    const tracks = videoElement.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].oncuechange = function () {
        // Backup original cue start/end times if not already cached
        if (tracks[i].cues) {
          for (let j = 0; j < tracks[i].cues.length; j++) {
            const cue = tracks[i].cues[j];
            if (!originalCuesMap.has(cue)) {
              originalCuesMap.set(cue, {
                startTime: cue.startTime,
                endTime: cue.endTime
              });
            }
          }
        }
      };
    }
  }

  // Switch Subtitle Language Track
  function setLanguage(videoElement, langCode) {
    if (!videoElement || !videoElement.textTracks) return;

    const tracks = videoElement.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      if (langCode === 'off') {
        tracks[i].mode = 'disabled';
      } else {
        if (tracks[i].language === langCode || tracks[i].label.toLowerCase().includes(langCode)) {
          tracks[i].mode = 'showing';
        } else {
          tracks[i].mode = 'hidden';
        }
      }
    }
  }

  // Adjust Subtitle Timing Offset (Drift Correction: e.g. +0.5s or -0.5s)
  function adjustOffset(videoElement, deltaSec) {
    activeOffsetSec += deltaSec;
    localStorage.setItem('anitube_subtitle_offset', activeOffsetSec);
    applyOffsetToTracks(videoElement);
    return activeOffsetSec;
  }

  // Reset Subtitle Timing Offset to 0
  function resetOffset(videoElement) {
    activeOffsetSec = 0;
    localStorage.removeItem('anitube_subtitle_offset');
    applyOffsetToTracks(videoElement);
    return 0;
  }

  function applyOffsetToTracks(videoElement) {
    if (!videoElement || !videoElement.textTracks) return;

    const tracks = videoElement.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.cues) {
        for (let j = 0; j < track.cues.length; j++) {
          const cue = track.cues[j];
          const orig = originalCuesMap.get(cue) || { startTime: cue.startTime, endTime: cue.endTime };
          cue.startTime = Math.max(0, orig.startTime + activeOffsetSec);
          cue.endTime = Math.max(0, orig.endTime + activeOffsetSec);
        }
      }
    }
  }

  function getOffset() {
    return activeOffsetSec;
  }

  return {
    init,
    setLanguage,
    adjustOffset,
    resetOffset,
    getOffset
  };
})();

window.AniTubeSubtitles = AniTubeSubtitles;
