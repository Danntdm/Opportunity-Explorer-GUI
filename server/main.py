"""Opportunity Explorer API (mock).

Run with:  uvicorn main:app --reload   (from the server/ folder, see README)

/api/chat currently returns pre-written questions. Later, replace the body of
`get_reply` with a call to the OpenAI API; the frontend won't need to change.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Opportunity Explorer API")

MOCK_QUESTIONS = [
    "Which steps in this workflow happen the same way over and over?",
    "Where does work usually get stuck or pile up?",
    "Which decisions need a person's judgment or experience?",
    "Is any sensitive information involved, such as personal data or passwords?",
    "What happens when a mistake is made? Can it be undone easily?",
]


class Message(BaseModel):
    role: str  
    content: str


class ChatRequest(BaseModel):
    workflow_name: str
    description: str
    messages: list[Message] = []


def get_reply(body: ChatRequest):
    """Return (reply, done). Mock: asks the next pre-written question."""
    answered = sum(1 for m in body.messages if m.role == "user")
    if answered < len(MOCK_QUESTIONS):
        return MOCK_QUESTIONS[answered], False
    return "Thanks, that's all I need for now.", True


@app.post("/api/chat")
def chat(body: ChatRequest):
    reply, done = get_reply(body)
    return {"reply": reply, "done": done}
