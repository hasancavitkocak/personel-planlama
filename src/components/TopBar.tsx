import { ShellBar, ShellBarItem, Avatar } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import '@ui5/webcomponents-icons/dist/employee.js';

interface TopBarProps {
  onCreateWorkOrder: () => void;
  onRefresh: () => void;
}

export default function TopBar({ onCreateWorkOrder, onRefresh }: TopBarProps) {
  return (
    <ShellBar
      primaryTitle="Personel Planlama"
      secondaryTitle="Bakım iş gücü planlama ve atama sistemi"
      profile={<Avatar icon="employee" />}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        borderBottom: '1px solid var(--sapList_BorderColor)'
      }}
    >
      <ShellBarItem icon="refresh" text="Yenile" onClick={onRefresh} />
      <ShellBarItem icon="add" text="Yeni İş Emri" onClick={onCreateWorkOrder} />
    </ShellBar>
  );
}
