// Calls to the Python server. Vite forwards /api to http://localhost:8000 in dev.

async function post(path, body) {
  let res
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Is it running?')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed (${res.status}). Is the server running?`)
  }
  return res.json()
}

export async function getQuestions(workflowName, description) {
  const data = await post('/api/questions', { workflow_name: workflowName, description })
  return data.questions
}

// Returns either the report or { followUps: [...] } if the AI needs more information.
export function getReport(workflowName, description, answers, allowFollowUps) {
  return post('/api/report', {
    workflow_name: workflowName,
    description,
    answers,
    allow_follow_ups: allowFollowUps,
  })
}
