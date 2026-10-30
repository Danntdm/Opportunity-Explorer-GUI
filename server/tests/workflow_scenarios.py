from dataclasses import dataclass


@dataclass(frozen=True)
class Scenario:
    workflow_name: str
    description: str


MIXED_ACCESS = Scenario(
    workflow_name="Employee system access requests",
    description=(
        "Employees email free-text requests for access to business systems. A coordinator reads each "
        "message and copies the employee, role, requested systems, business reason, and requested "
        "duration into an access form. The form has required fields and a written role-to-access "
        "matrix. A manager and security analyst make the final approval decision. After approval, "
        "administrators provision access using one shared privileged administrator account, so the "
        "team cannot reliably tell who made each change."
    ),
)

WAREHOUSE = Scenario(
    workflow_name="Warehouse reorder reminders",
    description=(
        "An inventory system stores the current quantity and an approved numeric reorder point for "
        "each stocked item. Every morning a coordinator exports the item list, finds rows where "
        "quantity is below the reorder point, and creates the same standard purchase request for the "
        "approved supplier. A manager approves requests over $5,000. There is no free-text "
        "interpretation, document reading, drafting, or classification in the normal process. "
        "Discontinued items, unusual demand, supplier changes, suspected inventory errors, and "
        "orders over $5,000 stay with staff."
    ),
)

AMBIGUOUS = Scenario(
    workflow_name="Unclear service request handling",
    description=(
        "A team receives service requests by email and passes them between people until someone "
        "handles them. The volume, rules, exceptions, information involved, approval process, and "
        "consequences of mistakes have not been documented."
    ),
)

EVENT_INQUIRIES = Scenario(
    workflow_name="Community event inquiry intake",
    description=(
        "Community organizations email free-text questions about holding events at a public "
        "facility. A coordinator reads each email, copies the proposed date, attendance, room needs, "
        "accessibility needs, and requested services into an intake record, sends a standard "
        "acknowledgment, and routes the inquiry to the appropriate events employee. Staff make the "
        "final scheduling and permit decisions. Everyone uses an individual account, permissions are "
        "clear, and the workflow does not use shared credentials or highly sensitive records."
    ),
)


def answer_for(scenario, question):
    text = question.lower()

    if scenario == AMBIGUOUS:
        return (
            "I do not know. This has not been measured or documented, and I cannot confirm the "
            "rules, people, data, risks, exceptions, or whether mistakes can be undone."
        )

    if scenario == MIXED_ACCESS:
        if _mentions(text, "repeat", "often", "frequency", "how much", "normal day", "normal week"):
            return (
                "About 40 requests arrive each week. The coordinator repeatedly reads each email and "
                "copies the same five details into the form, which takes about six hours per week."
            )
        if _mentions(text, "wait", "slow", "bottleneck", "handoff", "pile"):
            return (
                "Requests wait when details are missing and while the manager and security analyst "
                "review them. Approved requests then pass to an administrator for provisioning."
            )
        if _mentions(text, "judgment", "experience", "approval", "decide", "unusual"):
            return (
                "The manager and security analyst must make the final access decision. Elevated, "
                "unusual, or conflicting access requires their judgment and recorded approval."
            )
        if _mentions(text, "rule", "policy", "exception", "outside"):
            return (
                "Required form fields and the role-to-access matrix are written rules. Elevated "
                "permissions, role conflicts, and requests outside the matrix are exceptions for staff."
            )
        if _mentions(text, "sensitive", "access", "account", "credential", "confidential"):
            return (
                "Requests contain employee identity, role, business reason, and requested systems. "
                "Employees have individual accounts, but administrators share one privileged account, "
                "so changes cannot be traced to one person. No credential values are included here."
            )
        return (
            "A wrong approval could expose confidential systems and may be difficult to reverse after "
            "data is viewed. The manager and security analyst must retain final approval authority."
        )

    if scenario == WAREHOUSE:
        if _mentions(text, "repeat", "often", "frequency", "how much", "normal day", "normal week"):
            return (
                "The coordinator repeats the same export, numeric comparison, and standard request for "
                "about 250 stocked items each weekday. It takes about 90 minutes per day."
            )
        if _mentions(text, "wait", "slow", "bottleneck", "handoff", "pile"):
            return (
                "An item that drops below its reorder point after the export waits until the next "
                "workday. Only requests over $5,000 wait for a manager."
            )
        if _mentions(text, "judgment", "experience", "approval", "decide", "unusual"):
            return (
                "People decide orders over $5,000, discontinued items, supplier changes, unusual "
                "demand, and suspected inventory errors. Normal rows use fixed approved values."
            )
        if _mentions(text, "rule", "policy", "exception", "outside"):
            return (
                "The written rule compares quantity with the approved reorder point and uses the "
                "approved supplier. The unusual cases listed in the description stay with staff."
            )
        if _mentions(text, "sensitive", "access", "account", "credential", "confidential"):
            return (
                "The system contains stock levels, suppliers, and business prices. Authorized staff "
                "use individual accounts with appropriate access, and nobody shares credentials."
            )
        return (
            "A standard request can normally be canceled before acceptance. The likely harm is excess "
            "stock or delay; large and unusual cases stay with staff."
        )

    if _mentions(text, "repeat", "often", "frequency", "how much", "normal day", "normal week"):
        return (
            "About 60 inquiries arrive each week. The coordinator repeatedly reads each free-text "
            "email, copies five details, sends an acknowledgment, and chooses an events employee."
        )
    if _mentions(text, "wait", "slow", "bottleneck", "handoff", "pile"):
        return (
            "Inquiries wait when event details are unclear. They can wait two days for clarification "
            "before the coordinator can route them to an events employee."
        )
    if _mentions(text, "judgment", "experience", "approval", "decide", "unusual"):
        return (
            "An events employee decides whether the date and facility are suitable and whether permits, "
            "staffing, or accommodations are needed. Final commitments always stay with staff."
        )
    if _mentions(text, "rule", "policy", "exception", "outside"):
        return (
            "The intake record has five required details and a fixed acknowledgment template. Large, "
            "unusual, or conflicting events are exceptions reviewed by staff."
        )
    if _mentions(text, "sensitive", "access", "account", "credential", "confidential"):
        return (
            "The inquiry includes an organizer's work contact details and public event information. It "
            "contains no payment, health, government ID, password, or confidential account information. "
            "Staff use individual accounts and role-based access, with no shared login."
        )
    return (
        "A copied detail or route can be corrected. A person confirms scheduling, permits, and "
        "commitments, so the system must not make or send those final decisions automatically."
    )


def _mentions(text, *terms):
    return any(term in text for term in terms)
