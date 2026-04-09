# Changelog

## [0.1.0] - 2026-04-09

### Added
- Copilot Settings DocType (singleton) with enabled, agent_url, sidebar_width, keyboard_shortcut
- JWT auth token API (`get_auth_token`)
- Vue 3 + TypeScript sidebar with WebSocket streaming
- Content block renderers: TextBlock (markdown-it), ChartBlock (ECharts), TableBlock, KPICards, StatusList
- Composables: useChat, useWebSocket, useAuth, useSettings
- Auto-reconnect with exponential backoff (max 30s)
- Push layout (shifts main content when sidebar opens)
- Keyboard shortcut support (configurable, default Ctrl+/)
- Dark mode support via CSS variables
- Connection status indicator
- Error display with severity categories (critical/warning/info)
- CI pipeline (lint, test, build)
