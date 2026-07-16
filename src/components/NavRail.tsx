import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/action-settings.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/manager.js';
import '@ui5/webcomponents-icons/dist/activity-items.js';

export type Page = 'calendar' | 'workorders' | 'personnel' | 'reports' | 'settings';

interface NavRailProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function NavRail({ activePage, onNavigate }: NavRailProps) {
  const handleSelectionChange = (e: any) => {
    const selectedPage = e.detail.item.dataset.page as Page;
    if (selectedPage) {
      onNavigate(selectedPage);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <SideNavigation onSelectionChange={handleSelectionChange} style={{ height: '100%' }}>
        <SideNavigationItem
          text="Takvim"
          icon="calendar"
          data-page="calendar"
          selected={activePage === 'calendar'}
        />
        <SideNavigationItem
          text="İş Emirleri"
          icon="activity-items"
          data-page="workorders"
          selected={activePage === 'workorders'}
        />
        <SideNavigationItem
          text="Personel"
          icon="group"
          data-page="personnel"
          selected={activePage === 'personnel'}
        />
        <SideNavigationItem
          text="Raporlar"
          icon="manager"
          data-page="reports"
          selected={activePage === 'reports'}
        />
        <SideNavigationItem
          text="Ayarlar"
          icon="action-settings"
          data-page="settings"
          selected={activePage === 'settings'}
        />
      </SideNavigation>
    </div>
  );
}
