import { useState } from 'react'
import Stepper from './Stepper'
import DescribeStep from './DescribeStep'
import PlaceholderStep from './PlaceholderStep'

const STAGES = ['Describe workflow', 'Follow-up questions', 'Opportunity Report']

export default function OpportunityExplorer() {
  const [stage, setStage] = useState(0)
  const [workflowName, setWorkflowName] = useState('')
  const [description, setDescription] = useState('')

  function startOver() {
    setStage(0)
    setWorkflowName('')
    setDescription('')
  }

  return (
    <div>
      <div className="toolbar">
        <button className="link" onClick={startOver}>
          Start over
        </button>
      </div>

      <Stepper stages={STAGES} current={stage} />

      <p className="notice">
        This tool only analyzes and recommends. It does not change any systems or code.
        Don't paste real names, passwords, or ticket contents.
      </p>

      {stage === 0 && (
        <DescribeStep
          workflowName={workflowName}
          description={description}
          onNameChange={setWorkflowName}
          onDescriptionChange={setDescription}
          onNext={() => setStage(1)}
        />
      )}
      {stage === 1 && (
        <PlaceholderStep
          title="Follow-up questions"
          onBack={() => setStage(0)}
          onNext={() => setStage(2)}
          nextLabel="Next: Opportunity Report →"
        />
      )}
      {stage === 2 && (
        <PlaceholderStep title="Opportunity Report" onBack={() => setStage(1)} />
      )}
    </div>
  )
}
