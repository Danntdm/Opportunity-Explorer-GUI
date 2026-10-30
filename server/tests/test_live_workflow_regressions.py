import os
import sys
import unittest
from pathlib import Path

from dotenv import load_dotenv


SERVER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER_DIR))
load_dotenv(SERVER_DIR / ".env")

import main  # noqa: E402
from workflow_scenarios import (  # noqa: E402
    AMBIGUOUS,
    EVENT_INQUIRIES,
    MIXED_ACCESS,
    WAREHOUSE,
    answer_for,
)


LIVE_EVALS_ENABLED = os.getenv("RUN_LIVE_LLM_EVALS") == "1"

RULE = "Simple rule (no AI)"
AI = "AI-assisted with human review"
HUMAN = "Keep human-controlled"
SAFEGUARD = "Add a safeguard"
UNKNOWN = "Not enough information"


@unittest.skipUnless(
    LIVE_EVALS_ENABLED,
    "set RUN_LIVE_LLM_EVALS=1 to call the configured AI provider",
)
class LiveWorkflowRegressionTests(unittest.TestCase):
    def test_mixed_access_requests_use_rules_ai_human_control_and_a_safeguard(self):
        result = run_scenario(MIXED_ACCESS)
        recommendations = recommendation_set(result["report"])

        self.assertTrue({RULE, AI, HUMAN, SAFEGUARD}.issubset(recommendations))
        self.assertTrue(
            any(
                item["recommendation"] == HUMAN
                and item["risk"] == "High"
                and item["humanReview"] == "Required"
                for item in result["report"]["opportunities"]
            ),
            "high-impact access approval must remain a high-risk, required human decision",
        )

    def test_predictable_warehouse_process_does_not_force_ai(self):
        result = run_scenario(WAREHOUSE)
        recommendations = recommendation_set(result["report"])

        self.assertIn(RULE, recommendations)
        self.assertNotIn(AI, recommendations)
        self.assertTrue(
            HUMAN in recommendations or UNKNOWN in recommendations,
            "exceptions should stay with staff or be marked unknown",
        )

    def test_ambiguous_workflow_asks_follow_ups_then_does_not_guess(self):
        result = run_scenario(AMBIGUOUS)
        opportunities = result["report"]["opportunities"]

        self.assertGreaterEqual(result["follow_up_count"], 1)
        self.assertLessEqual(result["follow_up_count"], main.MAX_FOLLOW_UPS)
        self.assertTrue(opportunities, "the final report should explain what information to gather")
        for opportunity in opportunities:
            with self.subTest(task=opportunity.get("task")):
                self.assertEqual(opportunity["recommendation"], UNKNOWN)
                self.assertEqual(opportunity["potential"], "Unknown")
                self.assertEqual(opportunity["risk"], "Unknown")

    def test_free_text_event_inquiries_use_ai_without_inventing_security_issue(self):
        result = run_scenario(EVENT_INQUIRIES)
        recommendations = recommendation_set(result["report"])

        self.assertTrue({RULE, AI, HUMAN}.issubset(recommendations))
        self.assertNotIn(SAFEGUARD, recommendations)
        self.assertTrue(
            any(
                item["recommendation"] == AI and item["humanReview"] in {"Yes", "Required"}
                for item in result["report"]["opportunities"]
            ),
            "free-text assistance must remain subject to human review",
        )


def run_scenario(scenario):
    question_data = main.questions(
        main.WorkflowRequest(
            workflow_name=scenario.workflow_name,
            description=scenario.description,
        )
    )
    questions = question_data["questions"]
    answers = [
        main.Answer(question=question, answer=answer_for(scenario, question))
        for question in questions
    ]

    response = main.report(
        main.ReportRequest(
            workflow_name=scenario.workflow_name,
            description=scenario.description,
            answers=answers,
            allow_follow_ups=True,
        )
    )
    follow_ups = response.get("followUps", [])
    if follow_ups:
        answers.extend(
            main.Answer(question=question, answer=answer_for(scenario, question))
            for question in follow_ups
        )
        response = main.report(
            main.ReportRequest(
                workflow_name=scenario.workflow_name,
                description=scenario.description,
                answers=answers,
                allow_follow_ups=False,
            )
        )

    return {
        "initial_question_count": len(questions),
        "follow_up_count": len(follow_ups),
        "report": response,
    }


def recommendation_set(report):
    return {item["recommendation"] for item in report["opportunities"]}


if __name__ == "__main__":
    unittest.main()
