# speedctl

A Chrome extension for advanced video playback speed control with rule-based automation. Currently supports YouTube.

## Features

- **Default Speed** — Set a global default playback speed (0.5x to 3.0x)
- **Channel Rules** — Automatically apply specific speeds per YouTube channel
- **Regex Rules** — Match video titles with regex patterns to set speeds automatically
- **Rule Priority** — Title regex > Channel rule > Default speed
- **Speed Overlay** — Displays the current speed on the video player
- **Keyboard Shortcuts** — Press `s` / `d` to decrease / increase speed
- **Popup** — Quickly add or update channel rules from the toolbar popup
- **Options Page** — Full settings UI for managing all rules

## Tech Stack

- [WXT](https://wxt.dev/) — Next-gen Web Extension Framework
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Vitest

## Installation

Requires [aqua](https://aquaproj.github.io/). All other dependencies (pnpm, dprint, etc.) are managed via `aqua.yaml`.

1. `aqua i` to install CLI tools
2. `pnpm i` to install Node dependencies
3. `pnpm dev` to start development with hot reload
4. Load the extension from `.output/chrome-mv3` in `chrome://extensions`

## Project Structure

```
src/
├── adapters/          # Site-specific adapters (YouTube)
├── components/        # Shared UI components (shadcn/ui)
├── entrypoints/
│   ├── background.ts  # Service worker
│   ├── content.ts     # Content script entry
│   ├── content/       # Content script modules (controller, overlay, shortcuts)
│   ├── popup/         # Toolbar popup UI
│   └── options/       # Options page UI
└── lib/               # Core logic (types, storage, rule engine, constants)
```

## License

MIT
