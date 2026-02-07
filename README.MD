# Design Hand-off: Media Player Control System (v2.4)

**Status:** Ready for Implementation  
**Compliance Target:** WCAG 2.2 AA  
**Platforms:** Web (Desktop/Mobile) & Smart TV (10ft Experience)

---

## 1. Intent Specification

The Media Player Control System is a universal interface for video playback. The goal is to provide a "barrier-free" viewing experience where users can control media regardless of their input method or visual ability.

* **Primary Purpose:** Provide semantic, performant, and accessible controls for media playback.
* **User Tasks:** Toggle play/pause, seek through timeline, manage volume/mute, toggle captions, and enter full-screen.
* **Input Support:**
  * **Pointer:** Mouse, Trackpad, Touch.
  * **Keyboard:** Linear Tab-navigation and global hotkeys.
  * **TV/Remote:** D-Pad (Up, Down, Left, Right), Select/OK, and Back buttons.
* **Assistive Tech Expectations:** The player should be identified as a `region` with a clear label. Status changes (buffering, volume level) must be communicated non-disruptively.
* **Accessibility Rules:**
  * **No Keyboard Traps:** Users must be able to Tab out of the player.
  * **Persistence:** Controls must remain visible as long as focus is within the control bar, even if the mouse is idle.
  * **Target Size:** All interactive elements must meet the 24x24px minimum area with 4px spacing (WCAG 2.2 Target Size).

---

## 2. State Matrix

This matrix defines how the UI responds to system and user-initiated state changes.

| State | Visual Indicator | Focus Handling | Announced Behavior (Screen Reader) |
| :--- | :--- | :--- | :--- |
| **Initial Loading** | Spinner in center. | Focus on the container. | "Loading video..." (via `aria-live="polite"`) |
| **Playing** | Controls fade after 3s. | Remains on last focused element. | "Playing" |
| **Paused** | Play icon changes to Pause; Controls persist. | Focus remains on Play/Pause button. | "Paused" |
| **Buffering** | Spinner over video; Timeline dimmed. | Focus is maintained. | "Buffering..." |
| **Seeking** | Progress bar thumb moves; Tooltip shows time. | Focus remains on Slider. | Current timestamp (e.g., "15 minutes, 22 seconds") |
| **Muted** | Volume icon has slash/cross. | Focus on Mute button. | "Volume muted" |
| **Full Screen** | Expanded viewport. | Focus trapped within player region. | "Entered Full Screen" |

---

## 3. Keyboard Interaction Map

Controls must support both standard Web Tab-flow and TV-specific Spatial Navigation.

| Key | Web Action | TV Remote Action |
| :--- | :--- | :--- |
| **Tab** | Move to next control in DOM order. | N/A (TV uses D-Pad). |
| **Shift + Tab** | Move to previous control. | N/A. |
| **Enter / Space** | Activate focused button (Play/Mute/etc). | **Select / OK:** Activate focused button. |
| **Arrow Right** | Seek forward 5 seconds. | Move focus right; Seek if on Progress Bar. |
| **Arrow Left** | Seek backward 5 seconds. | Move focus left; Seek if on Progress Bar. |
| **Arrow Up / Down** | Adjust Volume +/- 5%. | Move focus up/down between UI rows. |
| **M** | **Global:** Toggle Mute. | N/A. |
| **F** | **Global:** Toggle Full Screen. | N/A. |
| **Esc** | Close Settings Menu / Exit Full Screen. | **Back:** Close Menu / Exit Player. |

---

## 4. Screen Reader Expectations

Prioritize Semantic HTML. Use ARIA only when native elements cannot convey the specific media state.

| Element | HTML/Role | ARIA Attributes | Expected Announcement |
| :--- | :--- | :--- | :--- |
| **Player Container** | `<section>` | `aria-label="Video Player"` | "Video Player, region" |
| **Play/Pause** | `<button>` | `aria-label="Play"` or `aria-label="Pause"` | "Play, button" / "Pause, button" |
| **Progress Bar** | `input[type="range"]` | `aria-label="Seek slider"` | "Seek slider, 12 minutes, 45 seconds, slider" |
| **Mute Toggle** | `<button>` | `aria-pressed="true/false"` | "Mute, toggle button, pressed" |
| **Settings Menu** | `<button>` | `aria-expanded="false"`, `aria-haspopup="menu"` | "Settings, button, menu collapsed" |
| **Status Region** | `<div>` | `role="status"`, `aria-live="polite"` | "Connection lost," "Resuming playback" |

---

## 5. WCAG 2.2 Mapping Table

| Success Criterion | Feature Coverage | Validation Note |
| :--- | :--- | :--- |
| **1.4.3 Contrast (AA)** | All icons and labels have a minimum 4.5:1 ratio against the control bar background. | Test against translucent backgrounds with varying video colors. |
| **2.1.1 Keyboard (A)** | All player functionality is reachable via Tab and D-Pad. | Ensure "Skip Ad" buttons are in the Tab order. |
| **2.4.7 Focus Visible (AA)** | A high-contrast (3:1) focus ring appears around all interactive elements. | Focus ring must be visible against the video content itself. |
| **2.5.8 Target Size (AA)** | All buttons are at least 24x24px with surrounding space to total 44px. | Critical for TV D-Pad and mobile touch users. |
| **3.2.2 On Input (A)** | Changing volume or seeking does not move focus away from the control. | Focus must stay on the slider until the user manually moves it. |
| **4.1.2 Name, Role, Value (A)** | Use of `<button>` and `<input>` ensures name/role/value are exposed by default. | Avoid `<div>` for buttons to ensure standard AT support. |

---

### Implementation Notes for Engineering

* **TV Focus Engine:** Use the design system's `SpatialNavigation` hook to manage D-pad focus. Ensure the "Progress Bar" is treated as a single focus stop.

* **Live Regions:** Do not use `aria-live="assertive"` for time updates; it will interrupt the user's experience. Use `polite` or a hidden `status` role.

* **Media Session API:** Implement the `navigator.mediaSession` API to allow OS-level hardware keys (Play/Pause on keyboards/headphones) to sync with the player state.

### SCSS Styling System

Accessibility considerations summarized

Do not remove focus outlines. Use outline-offset and max() to create custom focus rings; or use :focus-visible for progressive enhancement.

Follow source order. Avoid reordering elements with order or grid placement; this preserves logical focus and reading order.

Use min() to cap large vertical spacing. This prevents huge gaps when the user zooms to 400 %.

Ensure interactive targets are at least 44 px. Include spacing around elements to meet WCAG target size criteria.

Prefer rem for sizes that should scale with the user’s font setting (typography, grid min widths). Use px or rem for padding/border values you don’t want to scale.

Hide content accessibly. Use .u-visually-hidden instead of display:none or visibility:hidden for screen‑reader‑only text.
