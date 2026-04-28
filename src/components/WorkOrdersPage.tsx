import type { WorkOrder, Assignment, Personnel } from '../types';
import { ClipboardList, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import WorkOrderCard from './WorkOrderCard';
import './WorkOrdersPage.css';

interface WorkOrdersPageProps {
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
  onCreateWorkOrder: () => void;
  onRemoveAssignment: (id: string) => void;
}

const statusColors: Record<string, string> = {
  unassigned: '#DC2626', assigned: '#1D4ED8', 'in-progress': '#D97706', completed: '#16A34A'
};

export default function WorkOrdersPage({ workOrders, assignments, personnel, onCreateWorkOrder, onRemoveAssignment }: WorkOrdersPageProps) {
  const unassigned = workOrders.filter(w => w.status === 'unassigned');
  const assigned = workOrders.filter(w => w.status === 'assigned');

  const getPersonnelName = (id: string | null) => personnel.find(p => p.id === id)?.name ?? '-';
  const getPersonnel = (id: string | null) => personnel.find(p => p.id === id);
  // Find the assignment record for an assigned work order to get time info
  const getAssignment = (workOrderId: string) => assignments.find(a => a.workOrderId === workOrderId);

  return (
    <div className="workorders-page">
      <div className="page-header">
        <div>
          <h2>İş Emirleri</h2>
          <p>{workOrders.length} iş emri · {assignments.length} atama</p>
        </div>
        <motion.button className="btn btn-primary" onClick={onCreateWorkOrder} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Plus size={16} /> Yeni İş Emri
        </motion.button>
      </div>

      <div className="wo-columns">
        {/* Unassigned */}
        <div className="wo-column">
          <div className="wo-col-header" style={{ '--col-color': statusColors.unassigned } as React.CSSProperties}>
            <AlertCircle size={14} />
            Atanmamış
            <span className="wo-col-badge">{unassigned.length}</span>
          </div>
          <div className="wo-col-body">
            {unassigned.length === 0 ? (
              <div className="empty-state">🎉 Tüm iş emirleri atandı!</div>
            ) : (
              unassigned.map((order, i) => <WorkOrderCard key={order.id} order={order} index={i} />)
            )}
          </div>
        </div>

        {/* Assigned */}
        <div className="wo-column">
          <div className="wo-col-header" style={{ '--col-color': statusColors.assigned } as React.CSSProperties}>
            <ClipboardList size={14} />
            Atanmış
            <span className="wo-col-badge">{assigned.length}</span>
          </div>
          <div className="wo-col-body">
            {assigned.length === 0 ? (
              <div className="empty-state">Henüz atanmış iş emri yok.</div>
            ) : (
              assigned.map((order, i) => {
                const p = getPersonnel(order.assignedTo);
                const asgn = getAssignment(order.id);
                const startH = asgn?.startHour ?? order.startHour;
                const endH = startH !== null ? startH + order.duration : null;
                return (
                  <motion.div key={order.id} className="assigned-wo-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="awo-header">
                      <span className="work-order-id">{order.id}</span>
                      <span className="priority-badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>Atanmış</span>
                    </div>
                    <div className="awo-title">{order.title}</div>
                    <div className="awo-meta">
                      {p && (
                        <span className="awo-person-inline">
                          <span className="tt-avatar-sm" style={{ background: p.color }}>{p.avatar}</span>
                          {p.name}
                        </span>
                      )}
                      {!p && <span>👤 {getPersonnelName(order.assignedTo)}</span>}
                      {(asgn?.date ?? order.plannedDate) && <span>📅 {asgn?.date ?? order.plannedDate}</span>}
                      {startH !== null && endH !== null && (
                        <span className="awo-time-range">🕐 {String(startH).padStart(2,'0')}:00 – {String(endH).padStart(2,'0')}:00</span>
                      )}
                      <span>⏱ {order.duration} saat</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="wo-column">
          <div className="wo-col-header" style={{ '--col-color': '#7C3AED' } as React.CSSProperties}>
            <ClipboardList size={14} />
            Takvim Atamaları
            <span className="wo-col-badge">{assignments.length}</span>
          </div>
          <div className="wo-col-body">
            {assignments.length === 0 ? (
              <div className="empty-state">Henüz takvim ataması yok.</div>
            ) : (
              assignments.map((a, i) => {
                const p = personnel.find(x => x.id === a.personnelId);
                return (
                  <motion.div key={a.id} className="assignment-wo-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="awo-header">
                      <span className="tt-avatar-sm" style={{ background: p?.color }}>{p?.avatar}</span>
                      <span className="awo-person">{p?.name}</span>
                      <button className="remove-btn" onClick={() => onRemoveAssignment(a.id)} title="Atamayı kaldır">✕</button>
                    </div>
                    <div className="awo-title">{a.title}</div>
                    <div className="awo-meta">
                      <span>📅 {a.date}</span>
                      <span className="awo-time-range">
                        🕐 {String(a.startHour).padStart(2,'0')}:00 – {String(a.startHour + a.duration).padStart(2,'0')}:00
                      </span>
                      <span>⏱ {a.duration} saat</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
