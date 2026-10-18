# Opportunity Explorer

## Setup (once)

```
npm install
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
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
