import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import App from './App'
import { AppStateProvider } from '@/context/AppStateContext'
import type { ExportedData } from '@/utils/file'

describe('App', () => {
  it('renders the application header placeholder', () => {
    render(
      <AppStateProvider>
        <App />
      </AppStateProvider>,
    )
    expect(
      screen.getByRole('heading', { name: /dynamic project timeline - quarterly view/i }),
    ).toBeInTheDocument()
  })

  it('triggers download when export is clicked', async () => {
    const user = userEvent.setup()
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    const createObjectURLSpy = vi.fn(() => 'blob:mock-export')
    const revokeSpy = vi.fn()
    Object.assign(URL, {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeSpy,
    })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(
      <AppStateProvider>
        <App />
      </AppStateProvider>,
    )

    await user.click(screen.getByRole('button', { name: /export/i }))

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()

    Object.assign(URL, {
      createObjectURL: originalCreate,
      revokeObjectURL: originalRevoke,
    })
    clickSpy.mockRestore()
  })

  it('imports timelines from a selected JSON file', async () => {
    const user = userEvent.setup()
    const data: ExportedData = {
      scenarios: [
        {
          name: 'Roadmap',
          tasks: [
            {
              name: 'Define Goals',
              swimlane: 'Strategy',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 60,
              color: 'blue',
            },
          ],
        },
      ],
      activeScenario: 'Roadmap',
      swimlanes: ['Strategy'],
      exportDate: new Date().toISOString(),
    }

    const file = new File([JSON.stringify(data)], 'import.json', {
      type: 'application/json',
    })
    ;(file as File & { text: () => Promise<string> }).text = async () =>
      JSON.stringify(data)

    const { container } = render(
      <AppStateProvider>
        <App />
      </AppStateProvider>,
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)

    const option = await screen.findByRole('option', { name: 'Roadmap' })
    expect(option).toBeInTheDocument()
  })

  it('shows an error when import parsing fails', async () => {
    const user = userEvent.setup()
    const invalidFile = new File(['{not json'], 'invalid.json', {
      type: 'application/json',
    })
    ;(invalidFile as File & { text: () => Promise<string> }).text = async () => '{not json'

    const { container } = render(
      <AppStateProvider>
        <App />
      </AppStateProvider>,
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, invalidFile)

    expect(await screen.findByText(/unable to parse/i)).toBeInTheDocument()
  })
})
