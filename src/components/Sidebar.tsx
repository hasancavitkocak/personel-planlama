import { useState } from 'react';
import type { User, WorkOrder, Assignment, Personnel } from '../types';
import { ClipboardList, Users, CalendarDays, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkOrderCard from './WorkOrderCard';
import './Sidebar.css';

interface SidebarProps {
  user: User;
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
  onRemoveAssignment: (assignmentId: string) => void;
}

export default function Sidebar({ user, workOrders, assignments, personnel, onRemoveAssignment }: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const unassignedOrders = workOrders.filter(wo => wo.status === 'unassigned');
  const todayAssignments = assignments.filter(a => a.date === new Date().toISOString().split('T')[0]);

  const stats = [
    { label: 'İş Emri', value: workOrders.length + assignments.length, icon: ClipboardList },
    { label: 'Atanmamış', value: unassignedOrders.length, icon: AlertCircle },
    { label: 'Personel', value: personnel.length, icon: Users },
    { label: 'Bugün', value: todayAssignments.length, icon: CalendarDays },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Only accept drops from assignment blocks (they have workOrderId field)
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('workOrder');
    if (!data) return;
    const dropped = JSON.parse(data);
    // Only handle assignments (they have workOrderId), not unassigned work orders
    if ('workOrderId' in dropped && dropped.workOrderId) {
      onRemoveAssignment(dropped.id);
    }
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar">{user.avatar}</div>
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>{user.role}</p>
          </div>
        </div>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="stat-label"><stat.icon size={10} />{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="hint-banner">
        <span className="hint-icon">💡</span>
        <div className="hint-text">
          <strong>Nasıl kullanılır?</strong>
          İş emirlerini takvime sürükleyin. Atamayı geri almak için buraya sürükleyin.
        </div>
      </div>

      <div
        className={`work-orders-section ${isDragOver ? 'drop-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="section-title">
          <ClipboardList size={13} />
          Atanmamış İş Emirleri
          <span className="section-badge">{unassignedOrders.length}</span>
        </div>

        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="unassign-drop-zone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <span>🔄</span>
              <span>Atamayı kaldırmak için bırakın</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="work-orders-list">
          {unassignedOrders.length === 0 && !isDragOver ? (
            <div className="empty-state">
              🎉 Tüm iş emirleri atandı!
            </div>
          ) : (
            unassignedOrders.map((order, index) => (
              <WorkOrderCard key={order.id} order={order} index={index} />
            ))
          )}
        </div>
      </div>
    </motion.aside>
  );
}
