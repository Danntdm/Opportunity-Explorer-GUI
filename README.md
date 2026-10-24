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
