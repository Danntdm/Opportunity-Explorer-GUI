import sys
import unittest
from pathlib import Path


SERVER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER_DIR))

import main  # noqa: E402


class PromptContractTests(unittest.TestCase):
    def test_mixed_access_requests_consider_all_four_intervention_types(self):
        for intervention in ("RULE candidate", "AI candidate", "HUMAN candidate", "SAFEGUARD candidate"):
            with self.subTest(intervention=intervention):
                self.assertIn(intervention, main.REPORT_PROMPT)
        self.assertIn("granting access", main.REPORT_PROMPT)
        self.assertIn('risk: "High"', main.REPORT_PROMPT)
        self.assertIn('humanReview: "Required"', main.REPORT_PROMPT)

    def test_predictable_workflow_is_allowed_to_have_no_ai_opportunities(self):
        self.assertIn("Zero AI opportunities is valid", main.REPORT_PROMPT)
        self.assertIn('"Simple rule (no AI)"', main.REPORT_PROMPT)
        self.assertIn("fixed, predictable logic", main.REPORT_PROMPT)

    def test_ambiguous_workflow_requires_follow_ups_and_unknowns_instead_of_guesses(self):
        self.assertIn("do NOT write the report yet", main.FOLLOW_UP_PROMPT)
        self.assertIn("Only ask about gaps that could materially change", main.FOLLOW_UP_PROMPT)
        self.assertIn("do not guess", main.REPORT_PROMPT)
        self.assertIn('potential must be "Unknown"', main.REPORT_PROMPT)
        self.assertIn('risk must be "Unknown"', main.REPORT_PROMPT)

    def test_free_text_can_use_ai_without_inventing_security_problems(self):
        self.assertIn("free-form emails, messages, notes, or requests", main.REPORT_PROMPT)
        self.assertIn('"AI-assisted with human review"', main.REPORT_PROMPT)
        self.assertIn("Do not invent a security problem", main.REPORT_PROMPT)


if __name__ == "__main__":
    unittest.main()
