"""Opportunity Explorer API.

Run with:  uvicorn main:app --reload   (from the server/ folder, see README)
"""

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from llm import LLMError, ask_json

load_dotenv()

app = FastAPI(title="Opportunity Explorer API")

NUM_QUESTIONS = 8
MAX_FOLLOW_UPS = 2

ROLE = """\
You are the Opportunity Explorer. You help people analyze an existing business workflow
to find realistic improvements. You never assume AI is the answer: sometimes AI helps,
sometimes a simple rule (like a checklist or a required form field) is better, and sometimes a task is
too risky to change and a person should stay in control.

Write for an average person who does this work day to day, not a technical expert.
Use everyday words and short sentences. Avoid jargon (like "shadow mode", "baseline",
"routing", "triage"); if a technical term is really needed, explain it in a few words.
"""

QUESTION_STYLE = """\
Make every question easy to answer for someone who does the work:
- Ask about something concrete they see or do, not an abstract concept.
- Ask one thing only.
- When it helps, add a short example of the kind of answer you want, e.g.
  "Roughly how many requests come in on a normal day: a handful, dozens, or hundreds?"
"""

QUESTIONS_PROMPT = ROLE + f"""
Write exactly {NUM_QUESTIONS} follow-up questions about the workflow the user describes,
one for each of these areas, in this order:
1. Repetition: which steps are done the same way over and over
2. Frequency: how often the workflow runs and how much work comes in
3. Bottlenecks: where work waits, piles up, or slows down
4. Handoffs: where work passes between people, teams, or systems
5. Human judgment: which decisions need a person's experience
6. Rules: which steps follow clear written rules or policies
7. Sensitive information: personal data, passwords, money, or access involved
8. Mistakes: what happens when something goes wrong, and whether it can be undone

Make each question specific to this workflow (mention its actual steps, people, or tools).
""" + QUESTION_STYLE + """
Reply with JSON only: {"questions": ["...", "..."]}
"""

FOLLOW_UP_PROMPT = f"""
Before writing the report, check whether you have enough information. If an answer was
vague, skipped, or something important for your recommendations is still unclear, do NOT
write the report. Instead reply with JSON only: {{"followUps": ["...", "..."]}}
containing 1 to {MAX_FOLLOW_UPS} questions that would fill the most important gaps.
""" + QUESTION_STYLE + """
Only ask follow-ups if they are truly needed; otherwise write the report.
"""

# Editing REPORT_PROMPT: the wording, rules, and examples are safe to change, but keep:
# - The JSON field names (summary, sections, title, items, opportunities, task,
#   recommendation, potential, risk, humanReview, reasons, experiment). The report
#   page (src/components/ReportStep.jsx) reads these exact names.
# - The words "AI-assisted", "rule", and "human" in the recommendation names. The
#   colored AI / RULE / HUMAN label is picked from them; anything else shows as UNKNOWN.
REPORT_PROMPT = ROLE + """
Write an Opportunity Report for the workflow, based on the description and the answers.

Reply with JSON only, in this exact shape:
{
  "summary": "2-3 sentences describing how the workflow works today",
  "sections": [
    {"title": "Repetitive tasks", "items": ["..."]},
    {"title": "Bottlenecks", "items": ["..."]},
    {"title": "Important handoffs", "items": ["..."]},
    {"title": "Tasks requiring human judgment", "items": ["..."]},
    {"title": "Risks and privacy/security concerns", "items": ["..."]},
    {"title": "What we still need to know", "items": ["..."]}
  ],
  "opportunities": [
    {
      "task": "short task name in everyday words",
      "recommendation": one of the recommendations listed below,
      "potential": "High" or "Medium" or "Low" or "Unknown",
      "risk": "High" or "Medium" or "Low" or "Unknown",
      "humanReview": "Yes" or "No" or "Required",
      "reasons": ["2-3 short bullets explaining why you chose this recommendation"],
      "experiment": "a small, low-risk test anyone could understand, with a clear way to tell if it worked (for human-controlled tasks: a safeguard to add, see rules)"
    }
  ]
}

Recommendations (pick the simplest one that would work):
- "AI-assisted with human review": AI drafts or suggests, a person checks. Only when the
  task involves reading or writing varied text that simple rules can't handle.
- "Simple rule (no AI)": something predictable that always works the same way, such as an
  auto-reply, a template, a required form field, a fixed routing rule, a reminder, or a
  standard checklist everyone follows.
- "Keep human-controlled": too risky or too dependent on judgment to change.
- "Not enough information": the user's answers don't say enough to decide.

Rules:
- Include 3 to 8 opportunities, and use more than one kind of recommendation when it fits.
- Be specific: say exactly what would change, e.g. "add a required 'device type' field to
  the ticket form", not "improve the intake process".
- Every problem you list under "Bottlenecks" or "Risks and privacy/security concerns" must
  be addressed by an opportunity with a concrete fix, unless you say in that list item why
  it should be left as is.
- "risk" is how bad it would be if this change went wrong.
- Each reason must point to something the user said (their description or an answer),
  e.g. "You said tickets are categorized the same way every time".
- Tasks that grant access, handle security incidents, or where mistakes are severe or hard
  to undo must be "Keep human-controlled", with risk "High" and humanReview "Required".
  For these, the experiment is a safeguard that keeps a person approving, e.g. a second
  approver, a log of every approval, or access that expires automatically.
- Don't guess. If an answer is vague, skipped, or missing (e.g. "idk"), say so: use
  "Not enough information" with potential and risk "Unknown" for tasks you can't judge,
  with an experiment describing what to find out, and list the missing details under
  "What we still need to know". Never rate something "Low" just because you don't know.
  Leave that section's items empty only if nothing important is missing.
- Use plain language and short list items. Only use what the user told you; don't invent numbers.
"""


class WorkflowRequest(BaseModel):
    workflow_name: str
    description: str


class Answer(BaseModel):
    question: str
    answer: str


class ReportRequest(WorkflowRequest):
    answers: list[Answer]
    allow_follow_ups: bool = True


def workflow_text(body: WorkflowRequest):
    return f"Workflow name: {body.workflow_name}\n\nHow it currently works:\n{body.description}"


@app.post("/api/questions")
def questions(body: WorkflowRequest):
    try:
        data = ask_json(QUESTIONS_PROMPT, workflow_text(body))
    except LLMError as err:
        raise HTTPException(status_code=err.status_code, detail=str(err))
    return {"questions": data.get("questions", [])[:NUM_QUESTIONS]}


@app.post("/api/report")
def report(body: ReportRequest):
    """Returns the report, or (once per run) up to 2 follow-up questions if info is missing."""
    prompt = REPORT_PROMPT + (FOLLOW_UP_PROMPT if body.allow_follow_ups else "")
    qa = "\n".join(f"Q: {a.question}\nA: {a.answer}" for a in body.answers)
    try:
        data = ask_json(prompt, f"{workflow_text(body)}\n\nFollow-up answers:\n{qa}")
    except LLMError as err:
        raise HTTPException(status_code=err.status_code, detail=str(err))

    if body.allow_follow_ups and data.get("followUps"):
        return {"followUps": data["followUps"][:MAX_FOLLOW_UPS]}
    return {"workflowName": body.workflow_name, **data}
