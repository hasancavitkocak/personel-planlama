import { Plus, RefreshCw, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import './TopBar.css';

interface TopBarProps {
  onCreateWorkOrder: () => void;
  onRefresh: () => void;
}

export default function TopBar({ onCreateWorkOrder, onRefresh }: TopBarProps) {
  return (
    <motion.div
      className="top-bar"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="top-bar-brand">
        <div className="brand-icon">
          <CalendarDays size={18} />
        </div>
        <div className="top-bar-left">
          <h1>Personel Planlama</h1>
          <p>Bakım iş gücü planlama ve atama sistemi</p>
        </div>
      </div>
      <div className="top-bar-actions">
        <motion.button
          className="btn btn-secondary"
          onClick={onRefresh}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCw size={14} />
          Yenile
        </motion.button>
        <motion.button
          className="btn btn-primary"
          onClick={onCreateWorkOrder}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={16} />
          Yeni İş Emri
        </motion.button>
      </div>
    </motion.div>
  );
}
