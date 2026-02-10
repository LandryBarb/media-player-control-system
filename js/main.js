/**
 * Media Control Row Component
 * Implements accessible play/pause and settings controls for media playback
 */

class MediaControlRow {
  constructor(controlRow, mediaElement, settingsPanel) {
    // Core elements
    this.controlRow = controlRow;
    this.mediaElement = mediaElement;
    this.settingsPanel = settingsPanel;
    
    // Control buttons
    this.playPauseButton = controlRow.querySelector('.media-btn--play-pause');
    this.seekBackButton = controlRow.querySelector('.media-btn--seek-back');
    this.seekForwardButton = controlRow.querySelector('.media-btn:nth-of-type(3)');
    this.muteButton = controlRow.querySelector('.media-btn[aria-label="Mute"]');
    this.ccButton = controlRow.querySelector('.media-btn[aria-label="Subtitles and Audio"]');
    this.settingsButton = controlRow.querySelector('.media-btn[aria-label="Settings"]');
    this.fullscreenButton = controlRow.querySelector('.media-btn[aria-label="Enter Full Screen"]');
    
    // Timeline/progress elements
    this.timelineSlider = controlRow.querySelector('.timeline-slider');
    this.timeDisplay = controlRow.querySelector('.time-display');
    
    // Icons
    this.pauseIcon = this.playPauseButton.querySelector('.icon--pause');
    this.playIcon = this.playPauseButton.querySelector('.icon--play') || this.playPauseButton.querySelector('svg');
    
    // Live region for announcements
    this.liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    
    // State
    this.isPlaying = false;
    this.isSettingsOpen = false;
    this.isSeeking = false;
    this.isMuted = false;
    
    // Bind methods
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleSeekBack = this.handleSeekBack.bind(this);
    this.handleSeekForward = this.handleSeekForward.bind(this);
    this.handleTimelineChange = this.handleTimelineChange.bind(this);
    this.handleTimelineInput = this.handleTimelineInput.bind(this);
    this.handleMute = this.handleMute.bind(this);
    this.handleFullscreen = this.handleFullscreen.bind(this);
    this.handleSettingsToggle = this.handleSettingsToggle.bind(this);
    this.handleMediaPlay = this.handleMediaPlay.bind(this);
    this.handleMediaPause = this.handleMediaPause.bind(this);
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
    this.handleLoadedMetadata = this.handleLoadedMetadata.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    
    // Initialize
    this.init();
  }
  
  init() {
    // Add event listeners to buttons
    this.playPauseButton?.addEventListener('click', this.handlePlayPause);
    this.seekBackButton?.addEventListener('click', this.handleSeekBack);
    this.seekForwardButton?.addEventListener('click', this.handleSeekForward);
    this.muteButton?.addEventListener('click', this.handleMute);
    this.fullscreenButton?.addEventListener('click', this.handleFullscreen);
    this.settingsButton?.addEventListener('click', this.handleSettingsToggle);
    
    // Timeline events
    this.timelineSlider?.addEventListener('input', this.handleTimelineInput);
    this.timelineSlider?.addEventListener('change', this.handleTimelineChange);
    
    // Listen to media element events for state sync
    this.mediaElement.addEventListener('play', this.handleMediaPlay);
    this.mediaElement.addEventListener('pause', this.handleMediaPause);
    this.mediaElement.addEventListener('ended', this.handleMediaPause);
    this.mediaElement.addEventListener('timeupdate', this.handleTimeUpdate);
    this.mediaElement.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    
    // Keyboard navigation for toolbar
    this.controlRow.addEventListener('keydown', this.handleKeyDown);
    
    // Global escape key listener
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Click outside to close settings
    document.addEventListener('click', this.handleClickOutside);
    
    // Set initial state based on media element
    this.updatePlayPauseState(!this.mediaElement.paused);
    this.updateTimeDisplay();
    
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Format time in MM:SS or HH:MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const padZero = (num) => String(num).padStart(2, '0');
    
    if (hours > 0) {
      return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
    }
    return `${minutes}:${padZero(secs)}`;
  }
  
  /**
   * Update time display
   */
 updateTimeDisplay() {
  if (!this.timeDisplay) return;
  
  const currentTime = this.formatTime(this.mediaElement.currentTime);
  const duration = this.formatTime(this.mediaElement.duration);
  
  const currentTimeSpan = this.timeDisplay.querySelector('.current-time');
  const durationSpan = this.timeDisplay.querySelector('.total-duration');
  
  if (currentTimeSpan) currentTimeSpan.textContent = currentTime;
  if (durationSpan) durationSpan.textContent = duration;
}
  
  /**
   * Handle play/pause button activation
   */
  async handlePlayPause(event) {
    event.preventDefault();
    
    try {
      if (this.isPlaying) {
        this.mediaElement.pause();
      } else {
        await this.mediaElement.play();
      }
    } catch (error) {
      console.error('Media playback error:', error);
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Unable to play media';
      }
    }
  }
  
  /**
   * Handle seek back 10 seconds
   */
  handleSeekBack(event) {
    event.preventDefault();
    this.mediaElement.currentTime = Math.max(0, this.mediaElement.currentTime - 10);
    if (this.liveRegion) {
      this.liveRegion.textContent = `Seeked to ${this.formatTime(this.mediaElement.currentTime)}`;
    }
  }
  
  /**
   * Handle seek forward 10 seconds
   */
  handleSeekForward(event) {
    event.preventDefault();
    this.mediaElement.currentTime = Math.min(
      this.mediaElement.duration,
      this.mediaElement.currentTime + 10
    );
    if (this.liveRegion) {
      this.liveRegion.textContent = `Seeked to ${this.formatTime(this.mediaElement.currentTime)}`;
    }
  }

  updateProgressBackground() {
  if (!this.timelineSlider) return;
  const max = parseFloat(this.timelineSlider.max) || this.mediaElement.duration || 0;
  const val = parseFloat(this.timelineSlider.value) || this.mediaElement.currentTime || 0;
  const pct = max > 0 ? (val / max) * 100 : 0;
  // set gradient: playedColor up to pct, remainingColor after pct
  this.timelineSlider.style.background = `linear-gradient(to right, var(--played-color) 0%, var(--played-color) ${pct}%, var(--remaining-color) ${pct}%, var(--remaining-color) 100%)`;
}
  
  /**
   * Handle timeline slider input (user dragging)
   */
  handleTimelineInput(event) {
    this.isSeeking = true;
    const newTime = parseFloat(event.target.value);
    this.mediaElement.currentTime = newTime;
    this.updateTimeDisplay();
    this.updateProgressBackground();
  }
  
  /**
   * Handle timeline slider change (user released)
   */
  handleTimelineChange(event) {
    this.isSeeking = false;
    if (this.liveRegion) {
      this.liveRegion.textContent = `Seeked to ${this.formatTime(this.mediaElement.currentTime)}`;
    }
    this.updateProgressBackground();
  }
  
  /**
   * Handle mute button
   */
  handleMute(event) {
    event.preventDefault();
    this.isMuted = !this.isMuted;
    this.mediaElement.muted = this.isMuted;
    
    const label = this.isMuted ? 'Unmute' : 'Mute';
    this.muteButton?.setAttribute('aria-label', label);
    
    if (this.liveRegion) {
      this.liveRegion.textContent = this.isMuted ? 'Muted' : 'Unmuted';
    }
  }
  
  /**
   * Handle fullscreen button
   */
  handleFullscreen(event) {
    event.preventDefault();
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (this.mediaElement.requestFullscreen) {
        this.mediaElement.requestFullscreen();
      } else if (this.mediaElement.webkitRequestFullscreen) {
        // Safari
        this.mediaElement.webkitRequestFullscreen();
      } else if (this.mediaElement.mozRequestFullScreen) {
        // Firefox
        this.mediaElement.mozRequestFullScreen();
      } else if (this.mediaElement.msRequestFullscreen) {
        // IE/Edge
        this.mediaElement.msRequestFullscreen();
      }
      
      this.fullscreenButton?.setAttribute('aria-label', 'Exit Full Screen');
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Entered fullscreen';
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      this.fullscreenButton?.setAttribute('aria-label', 'Enter Full Screen');
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Exited fullscreen';
      }
    }
  }
  
  /**
   * Update play/pause button state
   * @param {boolean} playing - Whether media is playing
   */
  updatePlayPauseState(playing) {
    this.isPlaying = playing;
    
    if (playing) {
      this.playPauseButton?.setAttribute('aria-label', 'Pause');
      this.playPauseButton?.setAttribute('aria-pressed', 'true');
      
      if (this.pauseIcon && this.playIcon) {
        if (this.pauseIcon.classList) {
          this.pauseIcon.style.display = 'block';
          this.playIcon.style.display = 'none';
        }
      }
      
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Playing';
      }
    } else {
      this.playPauseButton?.setAttribute('aria-label', 'Play');
      this.playPauseButton?.setAttribute('aria-pressed', 'false');
      
      if (this.pauseIcon && this.playIcon) {
        if (this.pauseIcon.classList) {
          this.pauseIcon.style.display = 'none';
          this.playIcon.style.display = 'block';
        }
      }
      
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Paused';
      }
    }
  }
  
  /**
   * Sync when media plays
   */
  handleMediaPlay() {
    this.updatePlayPauseState(true);
  }
  
  /**
   * Sync when media pauses
   */
  handleMediaPause() {
    this.updatePlayPauseState(false);
  }
  
  /**
   * Update timeline as media plays
   */
  handleTimeUpdate() {
    if (!this.isSeeking && this.timelineSlider) {
      this.timelineSlider.value = this.mediaElement.currentTime;
      this.updateTimeDisplay();
      this.updateProgressBackground();
    }
  }
  
  /**
   * Update timeline max and duration when metadata loads
   */
  handleLoadedMetadata() {
    if (this.timelineSlider) {
      this.timelineSlider.max = this.mediaElement.duration;
    }
    this.updateTimeDisplay();
    this.updateProgressBackground();
  }
  
  /**
   * Handle settings button toggle
   */
  handleSettingsToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isSettingsOpen) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }
  
  /**
   * Open settings panel
   */
  openSettings() {
    this.isSettingsOpen = true;
    this.settingsButton?.setAttribute('aria-expanded', 'true');
    this.settingsPanel?.removeAttribute('hidden');
    
    if (!this.prefersReducedMotion) {
      this.settingsPanel?.classList.add('is-opening');
      setTimeout(() => {
        this.settingsPanel?.classList.remove('is-opening');
      }, 300);
    }
  }
  
  /**
   * Close settings panel
   */
  closeSettings() {
    this.isSettingsOpen = false;
    this.settingsButton?.setAttribute('aria-expanded', 'false');
    
    if (!this.prefersReducedMotion) {
      this.settingsPanel?.classList.add('is-closing');
      setTimeout(() => {
        this.settingsPanel?.setAttribute('hidden', '');
        this.settingsPanel?.classList.remove('is-closing');
      }, 300);
    } else {
      this.settingsPanel?.setAttribute('hidden', '');
    }
    
    this.settingsButton?.focus();
  }
  
  /**
   * Handle arrow key navigation
   */
  handleKeyDown(event) {
    const buttons = [
      this.playPauseButton,
      this.seekBackButton,
      this.seekForwardButton,
      this.muteButton,
      this.ccButton,
      this.settingsButton,
      this.fullscreenButton
    ].filter(Boolean);
    
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    
    let nextIndex = null;
    
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        if (nextIndex < buttons.length) {
          event.preventDefault();
          buttons[nextIndex].focus();
        }
        break;
        
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        if (nextIndex >= 0) {
          event.preventDefault();
          buttons[nextIndex].focus();
        }
        break;
        
      case 'Home':
        event.preventDefault();
        buttons[0].focus();
        break;
        
      case 'End':
        event.preventDefault();
        buttons[buttons.length - 1].focus();
        break;
    }
  }
  
  /**
   * Handle Escape key to close settings
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape' && this.isSettingsOpen) {
      event.preventDefault();
      this.closeSettings();
    }
  }
  
  /**
   * Close settings when clicking outside
   */
  handleClickOutside(event) {
    if (!this.isSettingsOpen) return;
    
    const clickedInsidePanel = this.settingsPanel?.contains(event.target);
    const clickedSettingsButton = this.settingsButton?.contains(event.target);
    
    if (!clickedInsidePanel && !clickedSettingsButton) {
      this.closeSettings();
    }
  }
  
  /**
   * Cleanup method
   */
  destroy() {
    this.playPauseButton?.removeEventListener('click', this.handlePlayPause);
    this.seekBackButton?.removeEventListener('click', this.handleSeekBack);
    this.seekForwardButton?.removeEventListener('click', this.handleSeekForward);
    this.muteButton?.removeEventListener('click', this.handleMute);
    this.fullscreenButton?.removeEventListener('click', this.handleFullscreen);
    this.settingsButton?.removeEventListener('click', this.handleSettingsToggle);
    this.timelineSlider?.removeEventListener('input', this.handleTimelineInput);
    this.timelineSlider?.removeEventListener('change', this.handleTimelineChange);
    
    this.mediaElement.removeEventListener('play', this.handleMediaPlay);
    this.mediaElement.removeEventListener('pause', this.handleMediaPause);
    this.mediaElement.removeEventListener('ended', this.handleMediaPause);
    this.mediaElement.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.mediaElement.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    
    this.controlRow.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keydown', this.handleEscapeKey);
    document.removeEventListener('click', this.handleClickOutside);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initMediaControlRow() {
  const controlRow = document.querySelector('.media-control-row');
  const mediaElement = document.querySelector('video, audio');
  const settingsPanel = document.getElementById('playback-settings-panel');
  
  if (!controlRow || !mediaElement) {
    console.error('Media control row: Required elements not found');
    return null;
  }
  
  return new MediaControlRow(controlRow, mediaElement, settingsPanel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMediaControlRow);
} else {
  initMediaControlRow();
}

// ============================================================================
// EXPORT (if using modules)
// ============================================================================

// export { MediaControlRow, initMediaControlRow };