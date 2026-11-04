import { useState } from 'react'
import { getQuestions, getReport } from '../api'
import { deleteFromHistory, loadHistory, newAnalysisId, saveToHistory } from '../history'
import Sidebar from './Sidebar'
import DescribeStep from './DescribeStep'
import QuestionsChat from './QuestionsChat'
import ReportStep from './ReportStep'

const STAGES = ['Describe workflow', 'Follow-up questions', 'Report']

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
  const [analysisId, setAnalysisId] = useState(newAnalysisId)
  const [history, setHistory] = useState(loadHistory)
  const [viewingId, setViewingId] = useState(null)

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

  function loadQuestions() {
    run(async () => setQuestions(await getQuestions(workflowName, description)))
  }

  function handleDescribeNext() {
    setStage(1)
    if (questions.length === 0) loadQuestions()
  }


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
      setHistory(saveToHistory({ id: analysisId, workflowName, createdAt: Date.now(), report: data }))
      setStage(2)
    })
  }

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
    setAnalysisId(newAnalysisId())
    setViewingId(null)
  }

  function openHistory(id) {
    // The current analysis's own report opens as step 3; older reports open on their own.
    if (id === analysisId && report) {
      setViewingId(null)
      setStage(2)
    } else {
      setViewingId(id)
    }
  }

  function deleteHistory(id) {
    setHistory(deleteFromHistory(id))
    if (id === viewingId) setViewingId(null)
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

  const viewing = history.find((entry) => entry.id === viewingId)
  const activeHistoryId = viewing ? viewing.id : stage === 2 ? analysisId : null

  return (
    <div className="app">
      <Sidebar
        stages={STAGES}
        stage={stage}
        history={history}
        activeHistoryId={activeHistoryId}
        onNewAnalysis={startOver}
        onOpenHistory={openHistory}
        onDeleteHistory={deleteHistory}
      />

      <main className="main">
        <div className={`main-inner ${viewing || stage === 2 ? 'wide' : ''}`}>
          {error && <div className="alert error">{error}</div>}

          {viewing ? (
            <ReportStep
              report={viewing.report}
              savedAt={viewing.createdAt}
              backLabel="← Back to current analysis"
              onBack={() => setViewingId(null)}
            />
          ) : (
            <>
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
            </>
          )}
        </div>

        <footer className="footer">LA Tech Rising | KFlow Project</footer>
      </main>
    </div>
  )
}
