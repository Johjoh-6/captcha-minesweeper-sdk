# Captcha Minesweeper SDK

A Svelte 5 custom element that renders a minesweeper-style captcha and talks to the Captcha Sweeper API. Includes a small demo page.

## Usage

```html
<captcha-sweeper
  baseurl="https://your-api-url"
  difficulty="2"
  autoinit="true"
></captcha-sweeper>
```

The element emits `solved` and `failed` events.

## Development

- `npm install`
- `npm run dev` – library dev server
- `npm run demo` – open the demo page

## Builds

- `npm run build` – library bundle in `dist/`
- `npm run build:demo` – demo site in `demo-dist/`

## GitHub Pages

The demo is deployed via `.github/workflows/deploy.yml`. The build uses `vite.demo.config.ts`, which automatically sets the correct base path for project pages using the `GITHUB_REPOSITORY` environment variable.
