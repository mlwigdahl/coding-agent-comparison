import { Users } from 'lucide-react';
import { QuarterColumn } from './QuarterColumn';
import { QUARTERS } from '../../utils/constants';
import { parseQuarter } from '../../utils/dateHelpers';

export function TimelineHeader() {
  return (
    <div className="flex bg-white border-b-2 border-gray-300 sticky top-0 z-10">
      {/* Fixed Teams column */}
      <div className="flex items-center justify-center py-3 sm:py-4 px-3 sm:px-6 min-w-[120px] sm:min-w-[200px] bg-gray-100 border-r-2 border-gray-300 flex-shrink-0">
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-1 sm:mr-2" />
        <span className="font-semibold text-gray-900 text-sm sm:text-base">
          <span className="sm:hidden">Teams</span>
          <span className="hidden sm:inline">Teams</span>
        </span>
      </div>
      
      {/* Quarter columns - scrollable */}
      <div className="flex flex-1 overflow-x-auto">
        {QUARTERS.map((quarter, index) => {
          const { year } = parseQuarter(quarter);
          const isFirstQuarterOfYear = quarter.startsWith('Q1') || 
            (index > 0 && parseQuarter(QUARTERS[index - 1]).year !== year);
          
          return (
            <QuarterColumn
              key={quarter}
              quarter={quarter}
              isFirstQuarterOfYear={isFirstQuarterOfYear}
            />
          );
        })}
      </div>
    </div>
  );
}