import type { WorkOrder, Assignment, Personnel } from '../types';
import { Card, Tag, Icon, FlexBox, Avatar } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/message-information.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/sys-enter-2.js';
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
    { label: 'Toplam İş Emri', value: totalOrders, icon: 'activity-items', scheme: 'None' },
    { label: 'Atanmamış', value: unassigned, icon: 'message-information', scheme: '1' },
    { label: 'Atanmış', value: assigned, icon: 'sys-enter-2', scheme: '6' },
    { label: 'Toplam Saat', value: totalHours, icon: 'time-entry-request', scheme: '2' },
    { label: 'Personel Sayısı', value: personnel.length, icon: 'group', scheme: 'None' },
    { label: 'Bugünü Atama', value: todayAssignments.length, icon: 'calendar', scheme: '3' },
  ];

  return (
    <div className="reports-page" style={{ backgroundColor: 'var(--sapBackgroundColor)', padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--sapTextColor)', margin: 0 }}>Raporlar</h2>
        <p style={{ color: 'var(--sapContent_LabelColor)', margin: '4px 0 0 0' }}>Genel bakım planlama özeti</p>
      </div>

      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card style={{ width: '100%', height: '100px' }}>
              <FlexBox direction="Column" justifyContent="Center" style={{ height: '100%', padding: '16px' }}>
                <FlexBox justifyContent="SpaceBetween" alignItems="Center">
                  <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>{s.label}</span>
                  <Icon name={s.icon} style={{ width: '16px', height: '16px', color: 'var(--sapContent_LabelColor)' }} />
                </FlexBox>
                <FlexBox alignItems="Baseline" style={{ gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>{s.value}</span>
                  {s.scheme !== 'None' && <Tag colorScheme={s.scheme}>Durum</Tag>}
                </FlexBox>
              </FlexBox>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Priority breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--sapTextColor)' }}>Öncelik Dağılımı</h3>
              <div className="bar-chart" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {priorityCounts.map(p => (
                  <div key={p.label} className="bar-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="bar-label" style={{ width: '60px', fontSize: '0.8rem', color: 'var(--sapTextColor)' }}>{p.label}</span>
                    <div className="bar-track" style={{ flex: 1, height: '12px', backgroundColor: 'var(--sapList_BorderColor)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div
                        className="bar-fill"
                        style={{ height: '100%', background: p.color, borderRadius: '6px' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / maxPriority) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                    <span className="bar-count" style={{ width: '30px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--sapTextColor)', textAlign: 'right' }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personnel workload */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--sapTextColor)' }}>Personel İş Yükü (Toplam Saat)</h3>
              <div className="bar-chart" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {personnelLoad.map(p => (
                  <div key={p.id} className="bar-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="bar-label" style={{ width: '80px', fontSize: '0.8rem', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</span>
                    <div className="bar-track" style={{ flex: 1, height: '12px', backgroundColor: 'var(--sapList_BorderColor)', borderRadius: '6px', overflow: 'hidden' }}>
                      <motion.div
                        className="bar-fill"
                        style={{ height: '100%', background: p.color, borderRadius: '6px' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.totalPersonHours / maxLoad) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      />
                    </div>
                    <span className="bar-count" style={{ width: '40px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--sapTextColor)', textAlign: 'right' }}>{p.totalPersonHours}s</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Today's schedule */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card style={{ width: '100%' }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--sapTextColor)' }}>Bugünkü Atamalar</h3>
            {todayAssignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>Bugün için atama bulunmuyor.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--sapList_BorderColor)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1fr', padding: '12px 16px', backgroundColor: 'var(--sapList_HeaderBackground)', fontWeight: 'bold', color: 'var(--sapTextColor)', fontSize: '0.8rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
                  <span>Personel</span>
                  <span>İş Emri</span>
                  <span>Saat</span>
                  <span>Süre</span>
                  <span>Durum</span>
                </div>
                {todayAssignments.map((a, i) => {
                  const p = personnel.find(x => x.id === a.personnelId);
                  return (
                    <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1fr', padding: '12px 16px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--sapTextColor)', borderBottom: i < todayAssignments.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none' }}>
                      <FlexBox alignItems="Center" style={{ gap: '8px' }}>
                        {p && <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '24px', height: '24px' }} />}
                        <span>{p?.name}</span>
                      </FlexBox>
                      <span style={{ fontWeight: 'bold' }}>{a.title}</span>
                      <span>{String(a.startHour).padStart(2,'0')}:00</span>
                      <span>{a.duration} saat</span>
                      <div>
                        <Tag colorScheme={a.status === 'confirmed' ? '3' : a.status === 'completed' ? '6' : '2'}>
                          {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                        </Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
