import clsx from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'
import {
  CalendarDaysIcon as CalendarDaysOutlineIcon,
  ArrowDownTrayIcon as ArrowDownTrayOutlineIcon,
  ClockIcon as ClockOutlineIcon,
  PencilSquareIcon as PencilSquareOutlineIcon,
  PlusIcon as PlusOutlineIcon,
  TrashIcon as TrashOutlineIcon,
} from '@heroicons/react/24/outline'
import {
  CalendarDaysIcon as CalendarDaysSolidIcon,
  ArrowDownTrayIcon as ArrowDownTraySolidIcon,
  ClockIcon as ClockSolidIcon,
  PencilSquareIcon as PencilSquareSolidIcon,
  PlusIcon as PlusSolidIcon,
  TrashIcon as TrashSolidIcon,
} from '@heroicons/react/24/solid'

export type IconName = 'calendar' | 'clock' | 'download' | 'pen' | 'plus' | 'trash'

export type IconVariant = 'solid' | 'outline'

type IconProps = {
  name: IconName
  variant?: IconVariant
  className?: string
} & Omit<ComponentPropsWithoutRef<'svg'>, 'ref'>

const ICON_COMPONENTS: Record<IconName, Record<IconVariant, React.ElementType>> = {
  calendar: {
    solid: CalendarDaysSolidIcon,
    outline: CalendarDaysOutlineIcon,
  },
  clock: {
    solid: ClockSolidIcon,
    outline: ClockOutlineIcon,
  },
  download: {
    solid: ArrowDownTraySolidIcon,
    outline: ArrowDownTrayOutlineIcon,
  },
  pen: {
    solid: PencilSquareSolidIcon,
    outline: PencilSquareOutlineIcon,
  },
  plus: {
    solid: PlusSolidIcon,
    outline: PlusOutlineIcon,
  },
  trash: {
    solid: TrashSolidIcon,
    outline: TrashOutlineIcon,
  },
}

const Icon = ({ name, variant = 'outline', className, ...rest }: IconProps) => {
  const IconComponent = ICON_COMPONENTS[name][variant]

  return <IconComponent className={clsx(className)} aria-hidden="true" {...rest} />
}

export default Icon
