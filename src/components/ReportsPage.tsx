import type { WorkOrder, Assignment, Personnel } from '../types';
import { ClipboardList, Users, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import './ReportsPage.css';

interface ReportsPageProps {
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
}

const priorityLabels: Record<string, string> = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
const priorityColors: Record<string, string> = { critical: '#BE185D', high: '#DC2626', medium: '#D97706', low: '#16A34A' };

export default function ReportsPage({ workOrders, assignments, personnel }: ReportsPageProps) {
  const totalOrders = workOrders.length + assignments.length;
  const unassigned = workOrders.filter(w => w.status === 'unassigned').length;
  const assigned = workOrders.filter(w => w.status === 'assigned').length;
  const totalHours = assignments.reduce((s, a) => s + a.duration, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => a.date === today);

  // Priority breakdown
  const allItems = [...workOrders, ...assignments];
  const priorityCounts = ['critical', 'high', 'medium', 'low'].map(p => ({
    label: priorityLabels[p],
    color: priorityColors[p],
    count: allItems.filter(i => i.priority === p).length,
  }));
  const maxPriority = Math.max(...priorityCounts.map(p => p.count), 1);

  // Personnel workload
  const personnelLoad = personnel.map(p => {
    const todayHours = todayAssignments.filter(a => a.personnelId === p.id).reduce((s, a) => s + a.duration, 0);
    const totalPersonHours = assignments.filter(a => a.personnelId === p.id).reduce((s, a) => s + a.duration, 0);
    return { ...p, todayHours, totalPersonHours };
  }).sort((a, b) => b.totalPersonHours - a.totalPersonHours);

  const maxLoad = Math.max(...personnelLoad.map(p => p.totalPersonHours), 1);

  const statCards = [
    { label: 'Toplam İş Emri', value: totalOrders, icon: ClipboardList, color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Atanmamış', value: unassigned, icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Atanmış', value: assigned, icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Toplam Saat', value: totalHours, icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Personel', value: personnel.length, icon: Users, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Bugün Atama', value: todayAssignments.length, icon: TrendingUp, color: '#0891B2', bg: '#ECFEFF' },
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2>Raporlar</h2>
          <p>Genel bakım planlama özeti</p>
        </div>
      </div>

      <div className="stat-cards-grid">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className="report-stat-card"
            style={{ '--card-color': s.color, '--card-bg': s.bg } as React.CSSProperties}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="rsc-icon"><s.icon size={20} /></div>
            <div className="rsc-value">{s.value}</div>
            <div className="rsc-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="reports-grid">
        {/* Priority breakdown */}
        <motion.div className="report-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="report-card-title">Öncelik Dağılımı</div>
          <div className="bar-chart">
            {priorityCounts.map(p => (
              <div key={p.label} className="bar-row">
                <span className="bar-label">{p.label}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    style={{ background: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.count / maxPriority) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                </div>
                <span className="bar-count">{p.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Personnel workload */}
        <motion.div className="report-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="report-card-title">Personel İş Yükü (Toplam Saat)</div>
          <div className="bar-chart">
            {personnelLoad.map(p => (
              <div key={p.id} className="bar-row">
                <span className="bar-label">{p.name.split(' ')[0]}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    style={{ background: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.totalPersonHours / maxLoad) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  />
                </div>
                <span className="bar-count">{p.totalPersonHours}s</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's schedule */}
        <motion.div className="report-card full-width" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="report-card-title">Bugünkü Atamalar</div>
          {todayAssignments.length === 0 ? (
            <div className="empty-report">Bugün için atama bulunmuyor.</div>
          ) : (
            <div className="today-table">
              <div className="today-table-head">
                <span>Personel</span>
                <span>İş Emri</span>
                <span>Saat</span>
                <span>Süre</span>
                <span>Durum</span>
              </div>
              {todayAssignments.map(a => {
                const p = personnel.find(x => x.id === a.personnelId);
                return (
                  <div key={a.id} className="today-table-row">
                    <span className="tt-person">
                      <span className="tt-avatar" style={{ background: p?.color }}>{p?.avatar}</span>
                      {p?.name}
                    </span>
                    <span>{a.title}</span>
                    <span>{String(a.startHour).padStart(2,'0')}:00</span>
                    <span>{a.duration} saat</span>
                    <span className={`status-badge status-${a.status}`}>
                      {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
