import { Icon, Button, Avatar } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/action-settings.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/manager.js';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/date-time.js';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import '@ui5/webcomponents-icons/dist/employee.js';

export type Page = 'calendar' | 'workorders' | 'personnel' | 'reports' | 'settings' | 'planning';

interface NavRailProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onCreateWorkOrder?: () => void;
  onRefresh?: () => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'workorders', label: 'İş Emirleri', icon: 'activity-items' },
  { id: 'planning', label: 'Planlama', icon: 'date-time' },
  { id: 'calendar', label: 'Takvim', icon: 'calendar' },
  { id: 'personnel', label: 'Personel', icon: 'group' },
  { id: 'reports', label: 'Raporlar', icon: 'manager' },
  { id: 'settings', label: 'Ayarlar', icon: 'action-settings' },
];

export default function NavRail({ activePage, onNavigate, onCreateWorkOrder, onRefresh }: NavRailProps) {
  return (
    <header
      style={{
        height: '60px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border, #E2E8F0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        zIndex: 100,
        position: 'sticky',
        top: 0
      }}
    >
      {/* Left: Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #007AFF 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.35)',
            letterSpacing: '0.5px'
          }}
        >
          PP
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary, #0F172A)', lineHeight: 1.2 }}>
            Personel Planlama
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748B)', fontWeight: '500' }}>
            Bakım İş Gücü
          </span>
        </div>
      </div>

      {/* Center: Navigation Menu Items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '100%' }}>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
                background: isActive ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #1D4ED8' : '3px solid transparent',
                color: isActive ? '#1D4ED8' : '#475569',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                borderRadius: '6px 6px 0 0'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
                  e.currentTarget.style.color = '#0F172A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <Icon
                name={item.icon}
                style={{
                  width: '16px',
                  height: '16px',
                  color: isActive ? '#1D4ED8' : '#64748B'
                }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', justifyContent: 'flex-end' }}>
        {onRefresh && (
          <Button icon="refresh" design="Transparent" onClick={onRefresh} title="Yenile" />
        )}
        {onCreateWorkOrder && (
          <Button icon="add" design="Emphasized" onClick={onCreateWorkOrder}>
            Yeni İş Emri
          </Button>
        )}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />
        <Avatar icon="employee" colorScheme="Accent6" style={{ width: '34px', height: '34px', cursor: 'pointer' }} />
      </div>
    </header>
  );
}


