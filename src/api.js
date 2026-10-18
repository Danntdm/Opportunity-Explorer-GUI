// Calls to the Python server. Vite forwards /api to http://localhost:8000 in dev.

export async function sendChat(workflowName, description, messages) {
  let res
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_name: workflowName, description, messages }),
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
