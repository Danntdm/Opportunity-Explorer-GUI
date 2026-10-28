import { useState } from 'react'
import { getQuestions, getReport } from '../api'
import Stepper from './Stepper'
import DescribeStep from './DescribeStep'
import QuestionsChat from './QuestionsChat'
import ReportStep from './ReportStep'

const STAGES = ['Describe workflow', 'Follow-up questions', 'Opportunity Report']

export default function OpportunityExplorer() {
  const [stage, setStage] = useState(0)
  const [workflowName, setWorkflowName] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [followUpsAsked, setFollowUpsAsked] = useState(false)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function run(action) {
    setLoading(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Questions are generated once (1 request), then shown one at a time.
  function loadQuestions() {
    run(async () => setQuestions(await getQuestions(workflowName, description)))
  }

  function handleDescribeNext() {
    setStage(1)
    if (questions.length === 0) loadQuestions()
  }

  // The report is generated once and reused when going back and forth. The first time,
  // the AI may instead send up to 2 follow-up questions; after those, it writes the report.
  function handleQuestionsNext() {
    if (report) {
      setStage(2)
      return
    }
    run(async () => {
      const qa = questions.map((question, i) => ({ question, answer: answers[i] }))
      const data = await getReport(workflowName, description, qa, !followUpsAsked)
      if (data.followUps) {
        setQuestions([...questions, ...data.followUps])
        setFollowUpsAsked(true)
        return
      }
      setReport(data)
      setStage(2)
    })
  }

  // Editing an answer clears the saved report so the next one uses the corrected answer.
  function handleEdit(index, text) {
    setAnswers(answers.map((answer, i) => (i === index ? text : answer)))
    setReport(null)
  }

  function startOver() {
    setStage(0)
    setWorkflowName('')
    setDescription('')
    setQuestions([])
    setAnswers([])
    setFollowUpsAsked(false)
    setReport(null)
    setError('')
  }

  const done = questions.length > 0 && answers.length === questions.length
  const messages = []
  answers.forEach((answer, i) => {
    messages.push({ role: 'assistant', content: questions[i] })
    messages.push({ role: 'user', content: answer, answerIndex: i })
  })
  if (done) {
    messages.push({ role: 'assistant', content: 'Thanks! Click Next to get your report.' })
  } else if (questions.length > 0) {
    messages.push({ role: 'assistant', content: questions[answers.length] })
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              OE
            </span>
            Opportunity Explorer
          </div>
          <button className="ghost" onClick={startOver}>
            Start over
          </button>
        </div>
      </header>

      <main className="container">
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
            onAnswer={(answer) => setAnswers([...answers, answer])}
            onEdit={handleEdit}
            onRetry={loadQuestions}
            onBack={() => setStage(0)}
            onNext={handleQuestionsNext}
          />
        )}
        {stage === 2 && report && <ReportStep report={report} onBack={() => setStage(1)} />}
      </main>
    </>
  )
}
