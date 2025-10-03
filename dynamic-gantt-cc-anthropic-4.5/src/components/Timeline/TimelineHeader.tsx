import { Users } from 'lucide-react'
import { QUARTERS } from '../../constants'

/**
 * TimelineHeader component - Displays column headers for quarters
 * Shows "Teams" in first column, then Q1-Q4 for years 2025-2028
 */
export function TimelineHeader() {
  const isFirstQuarterOfYear = (quarter: string): boolean => {
    return quarter.startsWith('Q1')
  }

  return (
    <div className="sticky top-0 z-10 bg-gray-50 border-b-2 border-gray-300">
      <div className="grid" style={{ gridTemplateColumns: '200px repeat(16, 100px)' }}>
        {/* Teams header */}
        <div className="flex items-center gap-2 p-4 font-semibold text-gray-700 border-r border-gray-300">
          <Users size={20} aria-hidden="true" />
          <span>Teams</span>
        </div>

        {/* Quarter headers */}
        {QUARTERS.map((quarter) => {
          const [quarterNum, year] = quarter.split(' ')
          const isYearStart = isFirstQuarterOfYear(quarter)

          return (
            <div
              key={quarter}
              className={`flex flex-col items-center justify-center p-4 text-center ${
                isYearStart && year !== '2025' ? 'border-l-2 border-gray-400' : ''
              }`}
            >
              <div className="font-bold text-gray-900">{quarterNum}</div>
              <div className="text-sm text-gray-500">{year}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
