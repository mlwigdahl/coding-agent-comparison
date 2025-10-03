import { parseQuarter } from '../../utils/dateHelpers';
import { Quarter } from '../../types';

export interface QuarterColumnProps {
  quarter: Quarter;
  isFirstQuarterOfYear?: boolean;
}

export function QuarterColumn({ quarter, isFirstQuarterOfYear = false }: QuarterColumnProps) {
  const { quarter: quarterNum, year } = parseQuarter(quarter);
  
  return (
    <div 
      className="relative flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px] bg-gray-50 border-r border-gray-200"
      style={{
        // Add gray separator before each year (SPEC.md requirement)
        borderLeftWidth: isFirstQuarterOfYear ? '2px' : '1px',
        borderLeftColor: isFirstQuarterOfYear ? '#9CA3AF' : '#E5E7EB'
      }}
    >
      {/* Quarter designation in bold */}
      <div className="text-xs sm:text-sm font-bold text-gray-900">
        Q{quarterNum}
      </div>
      
      {/* Year in smaller and grayer text */}
      <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">
        {year}
      </div>
    </div>
  );
}