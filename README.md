# Frappe Copilot Frontend

AI sidebar for ERPNext. Vue 3 + TypeScript frontend that connects to the [Copilot Agent](https://github.com/vyogotech/frappe-copilot-agent) service over WebSocket.

## Installation

```bash
bench get-app https://github.com/vyogotech/frappe-copilot-frontend.git
bench --site <site-name> install-app frappe_copilot
bench build
bench restart
```

## Configuration

1. Go to **Copilot Settings** in ERPNext
2. Set the **Agent URL** (default: `ws://localhost:8484`)
3. Enable the sidebar
4. Click **Test Connection** to verify

### Environment Variable

Set `COPILOT_JWT_SECRET` in your Frappe site's environment to match the Agent service:

```bash
export COPILOT_JWT_SECRET=your-shared-secret
```

## Development

```bash
cd frontend
npm install
npm run dev      # Vite dev server
npm test         # Run tests
npm run build    # Production build
```

## Architecture

- **Python backend**: Copilot Settings DocType, JWT auth API
- **Vue 3 frontend**: TypeScript, Composition API, markdown-it, ECharts
- **WebSocket Protocol v2**: Streaming events (ack, token, content_block, tool_start, tool_end, error, done)
- **Content blocks**: Text, Chart, Table, KPI, StatusList — pure renderer components

## License

MIT
