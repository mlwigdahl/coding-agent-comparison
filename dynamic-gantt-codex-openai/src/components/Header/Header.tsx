import React from 'react';
import ScenarioSelect from './ScenarioSelect';
import HeaderButtons from './HeaderButtons';
import { APP_TITLE } from '../../state/constants';
import { useModal } from '../Modals/ModalContext';
import { useAppDispatch, useAppState } from '../../state/context';
import { exportAppData } from '../../io/export';
import { openImportDialog } from '../../io/import';
import { type AppData } from '../../state/types';
import { type Action } from '../../state/actions';
import { AppDataSchema } from '../../state/schema';
import CalendarIcon from '../Icons/Calendar';

export default function Header() {
  const { openTaskCreate, openTeamCreate } = useModal();
  const state = useAppState();
  const dispatch = useAppDispatch();
  return (
    <header className="bg-black text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="font-bold whitespace-nowrap">{APP_TITLE}</h1>
          <div className="ml-2">
            <ScenarioSelect />
          </div>
        </div>
        <HeaderButtons
          onAddTask={() => openTaskCreate()}
          onAddTeam={() => openTeamCreate()}
          onExport={() => exportAppData(state)}
          onImport={() =>
            openImportDialog(
              (data: AppData) => dispatch({ type: 'IMPORT_DATA', payload: AppDataSchema.parse(data) } as Action),
              (msg) => alert(msg)
            )
          }
        />
      </div>
    </header>
  );
}
