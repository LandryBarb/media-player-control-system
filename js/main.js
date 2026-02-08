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
    this.playPauseButton = controlRow.querySelector('.media-control-button--play-pause');
    this.settingsButton = controlRow.querySelector('.media-control-button--settings');
    
    // Icons
    this.playIcon = this.playPauseButton.querySelector('.media-control-icon--play');
    this.pauseIcon = this.playPauseButton.querySelector('.media-control-icon--pause');
    
    // Labels
    this.playPauseLabel = this.playPauseButton.querySelector('.media-control-label');
    
    // Live region for announcements (optional)
    this.liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    
    // State
    this.isPlaying = false;
    this.isSettingsOpen = false;
    
    // Bind methods
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleSettingsToggle = this.handleSettingsToggle.bind(this);
    this.handleMediaPlay = this.handleMediaPlay.bind(this);
    this.handleMediaPause = this.handleMediaPause.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    
    // Initialize
    this.init();
  }
  
  init() {
    // Add event listeners to buttons
    this.playPauseButton.addEventListener('click', this.handlePlayPause);
    this.settingsButton.addEventListener('click', this.handleSettingsToggle);
    
    // Listen to media element events for state sync
    this.mediaElement.addEventListener('play', this.handleMediaPlay);
    this.mediaElement.addEventListener('pause', this.handleMediaPause);
    this.mediaElement.addEventListener('ended', this.handleMediaPause);
    
    // Keyboard navigation for toolbar
    this.controlRow.addEventListener('keydown', this.handleKeyDown);
    
    // Global escape key listener
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Click outside to close settings
    document.addEventListener('click', this.handleClickOutside);
    
    // Set initial state based on media element
    this.updatePlayPauseState(!this.mediaElement.paused);
    
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      // Could announce error to user via live region
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Unable to play media';
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
      // Update to show "Pause" state
      this.playPauseButton.setAttribute('aria-label', 'Pause');
      this.playPauseButton.setAttribute('aria-pressed', 'true');
      
      // Toggle icons
      this.playIcon.setAttribute('hidden', '');
      this.pauseIcon.removeAttribute('hidden');
      
      // Update visible label if present
      if (this.playPauseLabel) {
        this.playPauseLabel.textContent = 'Pause';
      }
      
      // Optional: Announce to screen readers
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Playing';
      }
    } else {
      // Update to show "Play" state
      this.playPauseButton.setAttribute('aria-label', 'Play');
      this.playPauseButton.setAttribute('aria-pressed', 'false');
      
      // Toggle icons
      this.playIcon.removeAttribute('hidden');
      this.pauseIcon.setAttribute('hidden', '');
      
      // Update visible label if present
      if (this.playPauseLabel) {
        this.playPauseLabel.textContent = 'Play';
      }
      
      // Optional: Announce to screen readers
      if (this.liveRegion) {
        this.liveRegion.textContent = 'Paused';
      }
    }
  }
  
  /**
   * Sync when media plays (e.g., via native controls or API)
   */
  handleMediaPlay() {
    this.updatePlayPauseState(true);
  }
  
  /**
   * Sync when media pauses (e.g., via native controls or API)
   */
  handleMediaPause() {
    this.updatePlayPauseState(false);
  }
  
  /**
   * Handle settings button toggle
   */
  handleSettingsToggle(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent click outside handler
    
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
    
    // Update button state
    this.settingsButton.setAttribute('aria-expanded', 'true');
    
    // Show panel
    this.settingsPanel.removeAttribute('hidden');
    
    // Apply transition class if motion is allowed
    if (!this.prefersReducedMotion) {
      this.settingsPanel.classList.add('is-opening');
      
      // Remove class after transition
      setTimeout(() => {
        this.settingsPanel.classList.remove('is-opening');
      }, 300);
    }
    
    // Optionally move focus into panel
    // this.focusFirstSettingControl();
  }
  
  /**
   * Close settings panel
   */
  closeSettings() {
    this.isSettingsOpen = false;
    
    // Update button state
    this.settingsButton.setAttribute('aria-expanded', 'false');
    
    // Hide panel
    if (!this.prefersReducedMotion) {
      this.settingsPanel.classList.add('is-closing');
      
      setTimeout(() => {
        this.settingsPanel.setAttribute('hidden', '');
        this.settingsPanel.classList.remove('is-closing');
      }, 300);
    } else {
      this.settingsPanel.setAttribute('hidden', '');
    }
    
    // Return focus to settings button
    this.settingsButton.focus();
  }
  
  /**
   * Handle arrow key navigation within control row
   */
  handleKeyDown(event) {
    const buttons = [this.playPauseButton, this.settingsButton];
    const currentIndex = buttons.indexOf(document.activeElement);
    
    // Only handle if focus is on one of our buttons
    if (currentIndex === -1) return;
    
    let nextIndex = null;
    
    switch (event.key) {
      case 'ArrowRight':
        // Move to next button (respects LTR)
        nextIndex = currentIndex + 1;
        if (nextIndex < buttons.length) {
          event.preventDefault();
          buttons[nextIndex].focus();
        }
        break;
        
      case 'ArrowLeft':
        // Move to previous button (respects LTR)
        nextIndex = currentIndex - 1;
        if (nextIndex >= 0) {
          event.preventDefault();
          buttons[nextIndex].focus();
        }
        break;
        
      case 'Home':
        // Jump to first button
        event.preventDefault();
        buttons[0].focus();
        break;
        
      case 'End':
        // Jump to last button
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
    
    const clickedInsidePanel = this.settingsPanel.contains(event.target);
    const clickedSettingsButton = this.settingsButton.contains(event.target);
    
    if (!clickedInsidePanel && !clickedSettingsButton) {
      this.closeSettings();
    }
  }
  
  /**
   * Optional: Focus first interactive element in settings panel
   */
  focusFirstSettingControl() {
    const focusableElements = this.settingsPanel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  /**
   * Cleanup method
   */
  destroy() {
    // Remove event listeners
    this.playPauseButton.removeEventListener('click', this.handlePlayPause);
    this.settingsButton.removeEventListener('click', this.handleSettingsToggle);
    this.mediaElement.removeEventListener('play', this.handleMediaPlay);
    this.mediaElement.removeEventListener('pause', this.handleMediaPause);
    this.mediaElement.removeEventListener('ended', this.handleMediaPause);
    this.controlRow.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keydown', this.handleEscapeKey);
    document.removeEventListener('click', this.handleClickOutside);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the media control row component
 */
function initMediaControlRow() {
  const controlRow = document.querySelector('.media-control-row');
  const mediaElement = document.querySelector('video, audio'); // Adjust selector as needed
  const settingsPanel = document.getElementById('playback-settings-panel');
  
  if (!controlRow || !mediaElement || !settingsPanel) {
    console.error('Media control row: Required elements not found');
    return null;
  }
  
  return new MediaControlRow(controlRow, mediaElement, settingsPanel);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMediaControlRow);
} else {
  initMediaControlRow();
}

// ============================================================================
// RTL SUPPORT (Optional Enhancement)
// ============================================================================

/**
 * Adjust arrow key behavior for RTL layouts
 */
function isRTL() {
  return document.dir === 'rtl' || 
         document.documentElement.dir === 'rtl' ||
         getComputedStyle(document.documentElement).direction === 'rtl';
}

// If RTL support needed, modify handleKeyDown to swap ArrowLeft/ArrowRight behavior

// ============================================================================
// EXPORT (if using modules)
// ============================================================================

// export { MediaControlRow, initMediaControlRow };