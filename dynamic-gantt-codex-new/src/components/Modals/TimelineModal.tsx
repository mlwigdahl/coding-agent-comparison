import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import clsx from 'clsx'

import Icon from '@/components/Icons/Icon'
import { useAppState } from '@/context/AppStateContext'
import { ValidationError } from '@/utils/validation'
import { logError } from '@/utils/logger'
import useFocusTrap from '@/hooks/useFocusTrap'
import styles from './TimelineModal.module.css'

type TimelineModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TimelineModal = ({ isOpen, onClose }: TimelineModalProps) => {
  const { addTimeline } = useAppState()
  const [name, setName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setName('')
    setErrorMessage('')

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useFocusTrap(dialogRef, isOpen)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isOpen) {
      return
    }

    try {
      addTimeline(name)
      onClose()
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Unable to save timeline. Please try again.')
        logError('Save timeline failed', error)
      }
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const isSaveDisabled = !name.trim()

  if (!isOpen) {
    return null
  }

  const headingId = 'timeline-modal-heading'
  const descriptionId = 'timeline-modal-description'

  return createPortal(
    <div className={styles.backdrop} role="presentation" onClick={handleBackdropClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <Icon name="clock" variant="solid" className={styles.headerIcon} />
          <div>
            <h2 id={headingId} className={styles.title}>
              Add New Timeline
            </h2>
            <p id={descriptionId} className={styles.description}>
              Give this timeline a memorable name to track strategic plans.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div role="alert" className={styles.error}>
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="timeline-name" className={styles.label}>
              Timeline Name
            </label>
            <input
              id="timeline-name"
              ref={inputRef}
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Expansion Plan"
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={clsx(styles.button, styles.secondaryButton)}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(styles.button, styles.primaryButton)}
              disabled={isSaveDisabled}
            >
              Save Timeline
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default TimelineModal
