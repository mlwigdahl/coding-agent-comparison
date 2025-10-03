import { Fragment, type CSSProperties } from 'react'
import { DEFAULT_TIMELINE_QUARTERS, formatQuarterLabel } from '@/utils/quarter'
import styles from './TimelineGrid.module.css'

const QuarterHeader = () => {
  const headerStyle = {
    '--quarter-count': DEFAULT_TIMELINE_QUARTERS.length,
  } as CSSProperties

  return (
    <div className={styles.headerRow} style={headerStyle}>
      <div className={styles.headerCell}>
        <strong>Teams</strong>
      </div>
      {DEFAULT_TIMELINE_QUARTERS.map((quarter, index) => {
        const label = formatQuarterLabel(quarter)
        const [quarterLabel, year] = label.split(' ')
        const isNewYear = index % 4 === 0

        return (
          <Fragment key={label}>
            <div className={styles.quarterHeader} data-new-year={isNewYear ? 'true' : 'false'}>
              <div className={styles.quarterLabel}>
                <span>{quarterLabel.toUpperCase()}</span>
                <span>{year}</span>
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

export default QuarterHeader
