import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/action-settings.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/manager.js';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/date-time.js';

export type Page = 'calendar' | 'workorders' | 'personnel' | 'reports' | 'settings' | 'planning';

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
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      width: '240px',
      borderRight: '1px solid var(--sapList_BorderColor)',
      backgroundColor: 'var(--sapList_Background)',
      overflow: 'hidden'
    }}>
      {/* Sidebar Header / Logo */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        backgroundColor: 'var(--sapList_HeaderBackground)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #007AFF 0%, #1D4ED8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)'
        }}>
          PP
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--sapTextColor)', lineHeight: 1.2 }}>Personel</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)', fontWeight: '500' }}>Planlama</span>
        </div>
      </div>

      <SideNavigation onSelectionChange={handleSelectionChange} style={{ flex: 1, width: '100%' }}>
        <SideNavigationItem
          text="İş Emirleri"
          icon="activity-items"
          data-page="workorders"
          selected={activePage === 'workorders'}
        />
        <SideNavigationItem
          text="Planlama"
          icon="date-time"
          data-page="planning"
          selected={activePage === 'planning'}
        />
        <SideNavigationItem
          text="Takvim"
          icon="calendar"
          data-page="calendar"
          selected={activePage === 'calendar'}
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

