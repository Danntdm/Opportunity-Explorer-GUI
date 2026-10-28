# Opportunity Explorer

## Setup (once)

```
npm install
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

Create a file called `.env` inside the `server` folder:

```
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-6-luna
```

For Gemini instead:

```
LLM_API_KEY=your-gemini-key
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL=gemini-2.5-flash-lite
```

## Run

Terminal 1:

```
cd server
.venv\Scripts\python -m uvicorn main:app --reload
```

Terminal 2:

```
npm run dev
```

Open http://localhost:5173

## Test

Run the fast frontend and backend checks:

```
npm run test:all
```

The backend suite includes four live workflow regressions that are skipped by default so ordinary
test runs do not call an AI provider. To run them in PowerShell with the provider settings from
`server/.env`:

```
$env:RUN_LIVE_LLM_EVALS = "1"
npm run test:server
Remove-Item Env:RUN_LIVE_LLM_EVALS
```

The live checks cover mixed access requests, predictable warehouse reordering, ambiguous requests
that require follow-up questions, and free-text event inquiries without an invented security issue.
