// Hidden demo mode: open the app with ?demo in the address (http://localhost:5173/?demo).
// It adds a "Load demo workflow" button on step 1 and a "Fill demo answer" button on step 2.


export const isDemoMode = new URLSearchParams(window.location.search).has('demo')

export const DEMO_WORKFLOW = {
  name: 'IT Support Ticketing',
  description:
    'Employees submit IT problems by email or through a web form. A help desk coordinator reads ' +
    'each ticket, decides the category (hardware, software, network, or account access) and the ' +
    'priority, and assigns it to a technician. Technicians investigate, ask the employee for missing ' +
    'details when needed, fix the issue, write down what they did, and close the ticket. Requests ' +
    'for administrator access must be approved by the IT manager.',
}


export const DEMO_ANSWERS = [
  'We get about 60 tickets a day. Most are routine: password resets, printer problems, and ' +
    'software installs. The coordinator reads and categorizes every ticket by hand, which takes ' +
    'about 2 hours a day, and sends the same "we received your ticket" email each time.',

  'Tickets pile up every morning until the coordinator gets through them. About a third are ' +
    'missing details like the device or the error message, so technicians email the employee and ' +
    'often wait a day for a reply. Work passes from the coordinator to a technician, and sometimes ' +
    'on to the network team.',

  'Setting priority when several urgent tickets arrive at once, diagnosing unusual problems, and ' +
    'approving administrator access all need experience. The IT manager personally decides every ' +
    'admin access request.',

  'Password resets and printer issues follow a written checklist. Priority has a simple rule: ' +
    'anything affecting a whole team is high. Exceptions are security incidents, requests from ' +
    "executives, and problems that don't fit any category.",

  'Tickets sometimes include personal details, and employees occasionally paste their passwords ' +
    'into a ticket by mistake. All technicians log into the admin console with one shared admin ' +
    "account, so we can't tell who changed what.",

  'A wrong category just delays a ticket and is easy to fix. But granting the wrong admin access ' +
    'or mishandling a security incident could expose company systems and would be hard to undo.',
]

export const DEMO_FOLLOW_UP_ANSWER =
  'Ticket descriptions are free text written by employees and are often vague. The help desk ' +
  'tool keeps a history of tickets and who they were assigned to, but not who used the shared ' +
  'admin account. Suspected security incidents go straight to the IT manager.'

export function demoAnswerFor(index) {
  return DEMO_ANSWERS[index] ?? DEMO_FOLLOW_UP_ANSWER
}
