import { render, screen } from '@testing-library/react'
import TaskCard from './TaskCard'
import styles from './TaskCard.module.css'

describe('TaskCard', () => {
  it('renders task information and progress bar', () => {
    const { container } = render(
      <TaskCard name="Design API" progress={45} color="blue" />,
    )

    expect(screen.getByText('Design API')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()

    const progressIndicator = container.querySelector(`.${styles.progressIndicator}`) as HTMLElement
    expect(progressIndicator).toBeTruthy()
    expect(progressIndicator.style.width).toBe('45%')
  })

  it('renders as an interactive element when onClick is provided', () => {
    render(<TaskCard name="Clickable" progress={90} color="indigo" onClick={() => {}} />)

    const card = screen.getByRole('button', { name: /clickable/i })
    expect(card).toHaveAttribute('tabindex', '0')
  })
})
