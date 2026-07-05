# Dry Night Tracker

Nightly bed-wetting log for sleep training. A wizard-style mobile web app for logging wake events during the night. Hosted on GitHub Pages.

## Recovery — fresh machine setup

### Prerequisites

- Node 18+
- A Google account (for Sheets backend)

### Environment setup

1. Clone: `git clone git@github.com:saginizar/dry-night-tracker.git`
2. Install: `npm install`
3. Copy env: `cp .env.example .env`
4. Fill in `.env` — see secret locations below

### Secret locations

| Variable | Where to get it |
|---|---|
| `VITE_GOOGLE_SHEETS_ID` | The ID from your Google Sheet URL |
| `VITE_GOOGLE_API_KEY` | Google Cloud Console > APIs & Services > Credentials |

### Run locally

```bash
npm run dev
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Project structure

```
src/              React app source
src/components/   Wizard step components
public/           Static assets
.env.example      Secret template — commit this, never .env
```

## Key decisions

- Static React app on GitHub Pages — no server, works from any phone browser
- Google Sheets as backend — coach/parents share one spreadsheet, no login needed beyond Google OAuth
