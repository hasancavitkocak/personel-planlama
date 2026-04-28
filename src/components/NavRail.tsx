import { CalendarDays, ClipboardList, Users, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import './NavRail.css';

export type Page = 'calendar' | 'workorders' | 'personnel' | 'reports' | 'settings';

interface NavRailProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; icon: React.ElementType; label: string }[] = [
  { page: 'calendar',   icon: CalendarDays,  label: 'Takvim' },
  { page: 'workorders', icon: ClipboardList, label: 'İş Emirleri' },
  { page: 'personnel',  icon: Users,         label: 'Personel' },
  { page: 'reports',    icon: BarChart2,      label: 'Raporlar' },
  { page: 'settings',   icon: Settings,      label: 'Ayarlar' },
];

export default function NavRail({ activePage, onNavigate }: NavRailProps) {
  return (
    <nav className="nav-rail">
      <div className="nav-rail-logo">
        <div className="nav-logo-icon">
          <CalendarDays size={20} />
        </div>
      </div>

      <div className="nav-rail-items">
        {navItems.map(({ page, icon: Icon, label }) => (
          <motion.button
            key={page}
            className={`nav-rail-item ${activePage === page ? 'active' : ''}`}
            onClick={() => onNavigate(page)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={label}
          >
            {activePage === page && (
              <motion.div
                className="nav-active-bg"
                layoutId="nav-active"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon size={20} />
            <span className="nav-label">{label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
