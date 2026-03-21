# speedctl — Product Spec & System Design

> A developer-friendly Chrome Extension for advanced playback speed control with rule-based automation. YouTube-first, but architected for multi-platform expansion.

## 1. Overview

**speedctl** is a Chrome Extension (Manifest V3) that gives users fine-grained control over video playback speed. Unlike basic speed controllers, speedctl features a **rule engine** that automatically applies playback speeds based on channel names and title patterns (regex). It targets power users and developers who consume a high volume of video content and want per-context speed automation.

**v1 targets YouTube exclusively**, but the architecture is designed so that adding support for other video platforms (Twitch, Vimeo, Netflix, Udemy, etc.) in the future requires only adding a new **site adapter** — no changes to the core rule engine, storage, or UI.

### Tech Stack

- **Framework**: WXT (wxt.dev) — Vite-based Chrome Extension framework
- **UI**: React + TypeScript
- **Components**: shadcn/ui — use actively for all Options Page UI (Table, Select, Input, Button, Alert, Card, Dialog, etc.)
- **Styling**: Tailwind CSS (shadcn/ui is built on top of it)
- **Storage**: `chrome.storage.local`
- **Target**: Manifest V3, Chrome

---

## 2. Features (v1)

### 2.1 Playback Speed Control

- Supported speeds: `0.5`, `1.0`, `1.5`, `2.0`, `2.5`, `3.0`
- Keyboard shortcuts:
  - `s` — decrease speed by one step
  - `d` — increase speed by one step
- Shortcuts are **disabled** when an input element is focused (comment box, search bar, etc.)
- Speed changes apply immediately to the `<video>` element on the page

### 2.2 Speed Overlay

- Display current playback speed in the **top-right corner** of the video player
- Style: semi-transparent, non-intrusive (e.g., `opacity: 0.5`, small font)
- **Always visible**, including at x1.0
- Auto-hides when the player is in fullscreen idle (follows YouTube's native control fade behavior) — _nice to have, not required for v1_

### 2.3 Rule Engine

Rules determine the playback speed automatically when a video is loaded or navigated to.

#### Rule Types

| Type            | Match Against              | Example              |
| --------------- | -------------------------- | -------------------- |
| **Default**     | All videos                 | Default speed = x2.0 |
| **Channel**     | Channel name (exact match) | "3Blue1Brown" → x1.5 |
| **Title Regex** | Video title (regex match)  | `/ASMR/i` → x1.0     |

#### Priority (fixed, not user-configurable)

```
Title Regex > Channel > Default
```

If multiple title regex rules match, the **first match in list order** wins.

#### Rule Evaluation

Rules are evaluated:

1. On initial video load
2. On YouTube SPA navigation (watch for `yt-navigate-finish` event)
3. The user can still manually override with shortcuts after a rule is applied

### 2.4 Options Page (Settings)

A full-page Options Page (`chrome-extension://...options.html`) for managing all settings. Built entirely with **shadcn/ui** components for a polished, consistent UI.

#### Sections

**Default Speed**

- `Select` component to choose the global default speed

**Channel Rules**

- `Table` with columns: Channel Name, Speed, Actions
- Each row: `Input` for channel name + `Select` for speed + `Button` (destructive) for delete
- `Button` to add a new rule
- `Card` wrapper with description text
- Empty state using `Alert` with helper text

**Title Regex Rules**

- `Table` with columns: Regex Pattern, Speed, Actions
- Each row: `Input` for regex + `Select` for speed + `Button` (destructive) for delete
- `Button` to add a new rule
- `Card` wrapper with description text
- Inline regex validation — show error via `Alert` (destructive variant) if invalid regex
- Empty state using `Alert` with helper text

**shadcn/ui components to install**: Button, Input, Select, Table, Card, Alert, Label, Separator

---

## 3. Architecture

### 3.1 Extension Structure

```
speedctl/
├── wxt.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── components.json              # shadcn/ui config
├── src/
│   ├── entrypoints/
│   │   ├── content.ts           # Content script — bootstrap & orchestration
│   │   ├── content/
│   │   │   ├── overlay.ts       # Speed overlay UI (injected into player)
│   │   │   ├── shortcuts.ts     # Keyboard shortcut handler
│   │   │   └── controller.ts    # Orchestrates adapter + rule engine + overlay
│   │   ├── options/             # Options page (React + shadcn/ui)
│   │   │   ├── index.html
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── DefaultSpeedSection.tsx
│   │   │   │   ├── ChannelRulesSection.tsx
│   │   │   │   ├── RegexRulesSection.tsx
│   │   │   │   └── SpeedSelect.tsx
│   │   │   └── main.tsx
│   │   └── background.ts       # Service worker (minimal, for lifecycle)
│   ├── lib/
│   │   ├── storage.ts           # chrome.storage.local wrapper
│   │   ├── constants.ts         # Speed steps, keys, defaults
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── rule-engine.ts       # Rule evaluation logic (platform-agnostic)
│   ├── adapters/                # Site adapters — platform-specific logic
│   │   ├── types.ts             # SiteAdapter interface
│   │   ├── youtube.ts           # YouTube adapter (v1)
│   │   └── index.ts             # Adapter registry & auto-detection
│   ├── components/ui/           # shadcn/ui components
│   └── assets/
│       └── icon.png
```

### 3.2 Site Adapter Pattern

To support multiple video platforms in the future, all platform-specific logic is isolated behind a `SiteAdapter` interface. The core rule engine, storage, shortcuts, and overlay logic are platform-agnostic.

```typescript
/**
 * Each supported site implements this interface.
 * v1 ships with YouTubeAdapter only.
 * To add a new platform, implement SiteAdapter and register it in the adapter registry.
 */
interface SiteAdapter {
	/** Unique identifier for this platform */
	readonly id: string; // e.g., 'youtube', 'twitch', 'vimeo'

	/** Check if the current page belongs to this platform */
	match(url: string): boolean;

	/** Find the <video> (or equivalent) element on the page */
	getVideoElement(): HTMLVideoElement | null;

	/** Find the container element to anchor the speed overlay */
	getPlayerContainer(): HTMLElement | null;

	/** Extract metadata from the current page */
	getVideoContext(): VideoContext;

	/** Register a callback for SPA navigation events */
	onNavigate(callback: () => void): () => void; // returns cleanup function
}

interface VideoContext {
	title: string | null;
	channelName: string | null;
}
```

The adapter registry auto-detects the current site:

```typescript
// adapters/index.ts
const adapters: SiteAdapter[] = [
	new YouTubeAdapter(),
	// new TwitchAdapter(),   // future
	// new VimeoAdapter(),    // future
];

export function detectAdapter(): SiteAdapter | null {
	return adapters.find((a) => a.match(window.location.href)) ?? null;
}
```

### 3.2 Data Model

```typescript
// Speed value type
type Speed = 0.5 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0;

// Rule types
interface ChannelRule {
	id: string; // UUID
	channelName: string; // Exact match
	speed: Speed;
}

interface RegexRule {
	id: string; // UUID
	pattern: string; // Regex pattern string
	speed: Speed;
}

// Root storage schema
interface SpeedctlConfig {
	defaultSpeed: Speed;
	channelRules: ChannelRule[];
	regexRules: RegexRule[]; // Ordered — first match wins
}
```

#### Default Config

```typescript
const DEFAULT_CONFIG: SpeedctlConfig = {
	defaultSpeed: 1.0,
	channelRules: [],
	regexRules: [],
};
```

### 3.3 Storage

- Use `chrome.storage.local` for all persistence
- Single key: `"speedctl_config"` storing the full `SpeedctlConfig` object
- Content script reads config on video load and on `storage.onChanged`
- Options page reads/writes config directly

### 3.4 Content Script Flow

```
[Page load / SPA navigation]
        │
        ▼
  detectAdapter() — find matching SiteAdapter for current URL
        │
        ▼ (if no adapter matches, do nothing)
  adapter.getVideoElement()
        │
        ▼
  adapter.getVideoContext()
    → { title, channelName }
        │
        ▼
  Load config from chrome.storage.local
        │
        ▼
  evaluateRules(context, config):
    1. regexRules — iterate in order, first match wins
    2. channelRules — find by channelName
    3. defaultSpeed
        │
        ▼
  Apply speed to <video>.playbackRate
        │
        ▼
  Render overlay inside adapter.getPlayerContainer()
        │
        ▼
  Register keyboard listeners (s / d)
    - Check: document.activeElement is not input/textarea/contenteditable
    - On trigger: adjust speed ±1 step, update overlay
        │
        ▼
  adapter.onNavigate(() => re-run from getVideoContext)
```

### 3.5 YouTube Adapter Implementation Details

The `YouTubeAdapter` implements `SiteAdapter` with YouTube-specific logic:

**SPA Navigation**: YouTube is a SPA. The adapter's `onNavigate` listens for the `yt-navigate-finish` event on `document`.

**Fallback**: Use a `MutationObserver` on the video player container to detect when the `<video>` element is replaced.

**Channel Name Extraction**: Channel name may not be available immediately on SPA navigation. Strategy:

1. Try to read from DOM immediately
2. If not found, set up a `MutationObserver` on the metadata area
3. Retry with exponential backoff (max 5 attempts, 500ms intervals)
4. Apply default speed while waiting, then re-evaluate once channel name is available

### 3.6 DOM Selectors (YouTube Adapter)

These selectors may change — keep them centralized in the YouTube adapter for easy updates:

```typescript
// adapters/youtube.ts
const YT_SELECTORS = {
	video: "video.html5-main-video",
	playerContainer: "#movie_player",
	channelName: "#channel-name yt-formatted-string a, #owner #channel-name a",
	videoTitle: "h1.ytd-watch-metadata yt-formatted-string, #title h1",
};
```

---

## 4. Key Implementation Notes

### 4.1 Keyboard Shortcuts

```typescript
const SPEED_STEPS: Speed[] = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

function isInputFocused(): boolean {
	const el = document.activeElement;
	if (!el) return false;
	const tag = el.tagName.toLowerCase();
	return (
		tag === "input" ||
		tag === "textarea" ||
		(el as HTMLElement).isContentEditable
	);
}

// 's' → decrease, 'd' → increase
document.addEventListener("keydown", (e) => {
	if (isInputFocused()) return;
	if (e.key === "s") decreaseSpeed();
	if (e.key === "d") increaseSpeed();
});
```

### 4.2 Overlay Injection

- Create a `<div>` and append it inside `#movie_player`
- Position: `absolute`, top-right
- Style: `pointer-events: none` so it doesn't interfere with player controls
- z-index above video but below YouTube's own controls
- Update text content on speed change

### 4.3 Handling playbackRate

YouTube's own player may reset `playbackRate` in certain scenarios (ad transitions, quality changes). Mitigate with:

1. Set `playbackRate` on the `<video>` element directly
2. Listen for `ratechange` event — if speed was changed externally and doesn't match our target, re-apply
3. Use a short debounce to avoid fighting with YouTube's own speed changes during ad breaks

### 4.4 Channel Name Extraction

Channel name may not be available immediately on SPA navigation. Strategy:

1. Try to read from DOM immediately
2. If not found, set up a `MutationObserver` on the metadata area
3. Retry with exponential backoff (max 5 attempts, 500ms intervals)
4. Apply default speed while waiting, then re-evaluate once channel name is available

---

## 5. Out of Scope (v1)

- Site adapters other than YouTube (Twitch, Vimeo, Netflix, etc.)
- Per-platform rule scoping
- JSON export/import of rules
- User-configurable rule priority/ordering
- Popup UI
- Side panel
- Overlay hide option at x1.0
- Sync across devices (`chrome.storage.sync`)
- Firefox / Safari support
- Playlist-level rules
- Per-video remembered speed

---

## 6. Future Considerations (v2+)

- **Multi-platform support** — add site adapters for Twitch, Vimeo, Netflix, Udemy, Coursera, etc. Each adapter implements the `SiteAdapter` interface. The rule engine, storage, and UI remain unchanged.
- **Per-platform rules** — extend `ChannelRule` and `RegexRule` with an optional `platform` field to scope rules per-site
- **JSON config export/import** — export rules as JSON, import from file or clipboard
- **Popup quick controls** — compact popup for speed adjustment without opening options
- **Rule templates** — prebuilt rulesets (e.g., "Music channels at x1.0")
- **Wildcard channel matching** — glob patterns for channel names
- **Statistics** — track time saved at higher speeds
- **`chrome.storage.sync`** — cross-device rule sync
- **Firefox / Safari support** — WXT supports multi-browser builds
