import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DescribeStep from '../components/DescribeStep'

describe('DescribeStep', () => {
  it('shows sensitive-information guidance beside the workflow description input', () => {
    render(
      <DescribeStep
        workflowName=""
        description=""
        onNameChange={() => {}}
        onDescriptionChange={() => {}}
        onNext={() => {}}
      />,
    )

    const description = screen.getByRole('textbox', { name: 'How does it currently work?' })
    const warning = screen.getByRole('note', { name: 'Sensitive information warning' })

    expect(warning.previousElementSibling).toContainElement(description)
    expect(warning).toHaveTextContent(/Do not enter passwords, API keys, credentials/i)
    expect(warning).toHaveTextContent(/personal information that is not needed/i)
    expect(warning).toHaveTextContent(/sent to the configured AI provider/i)
  })
})
