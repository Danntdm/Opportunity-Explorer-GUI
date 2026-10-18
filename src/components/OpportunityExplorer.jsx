import { useState } from 'react'
import { sendChat } from '../api'
import Stepper from './Stepper'
import DescribeStep from './DescribeStep'
import QuestionsChat from './QuestionsChat'
import ReportStep from './ReportStep'

const STAGES = ['Describe workflow', 'Follow-up questions', 'Opportunity Report']

export default function OpportunityExplorer() {
  const [stage, setStage] = useState(0)
  const [workflowName, setWorkflowName] = useState('')
  const [description, setDescription] = useState('')
  const [messages, setMessages] = useState([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function askModel(history) {
    setLoading(true)
    setError('')
    try {
      const data = await sendChat(workflowName, description, history)
      setMessages([...history, { role: 'assistant', content: data.reply }])
      setDone(data.done)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDescribeNext() {
    setStage(1)
    if (messages.length === 0) askModel([])
  }

  function handleAnswer(answer) {
    const history = [...messages, { role: 'user', content: answer }]
    setMessages(history)
    askModel(history)
  }

  function startOver() {
    setStage(0)
    setWorkflowName('')
    setDescription('')
    setMessages([])
    setDone(false)
    setError('')
  }

  return (
    <div>
      <div className="toolbar">
        <button className="link" onClick={startOver}>
          Start over
        </button>
      </div>

      <Stepper stages={STAGES} current={stage} />

      {error && <div className="alert error">{error}</div>}

      {stage === 0 && (
        <DescribeStep
          workflowName={workflowName}
          description={description}
          onNameChange={setWorkflowName}
          onDescriptionChange={setDescription}
          onNext={handleDescribeNext}
        />
      )}
      {stage === 1 && (
        <QuestionsChat
          messages={messages}
          done={done}
          loading={loading}
          onAnswer={handleAnswer}
          onRetry={() => askModel(messages)}
          onBack={() => setStage(0)}
          onNext={() => setStage(2)}
        />
      )}
      {stage === 2 && <ReportStep onBack={() => setStage(1)} />}
    </div>
  )
}
