import { useState } from 'react';
import type { WorkOrder, Assignment, Personnel } from '../types';
import { Card, Tag, Icon, FlexBox, Avatar } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/message-information.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/sys-enter-2.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import { motion, AnimatePresence } from 'framer-motion';
import './ReportsPage.css';

interface ReportsPageProps {
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
}

const priorityLabels: Record<string, string> = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
const priorityColors: Record<string, string> = { critical: '#BE185D', high: '#DC2626', medium: '#D97706', low: '#16A34A' };

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(' ');
  if (parts.length <= 1) return { firstName: fullName, lastName: '' };
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');
  return { firstName, lastName };
};

// Turkish week/month grouping helpers
const getWeekRange = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const formatDate = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  const year = monday.getFullYear();
  return {
    key: `${monday.toISOString().split('T')[0]}_${sunday.toISOString().split('T')[0]}`,
    label: `${formatDate(monday)} - ${formatDate(sunday)} ${year}`,
    mondayTime: monday.getTime()
  };
};

const getMonthLabel = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    label: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
    time: new Date(date.getFullYear(), date.getMonth(), 1).getTime()
  };
};

// Generate month options (current month and past 11 months)
const getMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
};

export default function ReportsPage({ workOrders, assignments, personnel }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'personnel'>('calendar');
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');

  const monthOptions = getMonthOptions();

  // Filter assignments based on month selection
  const filteredAssignments = assignments.filter(a => {
    if (selectedMonthFilter === 'all') return true;
    const [year, month] = selectedMonthFilter.split('-');
    const aDate = new Date(a.date + 'T00:00:00');
    return aDate.getFullYear() === parseInt(year) && (aDate.getMonth() + 1) === parseInt(month);
  });

  // Filter work orders based on month selection
  const filteredWorkOrders = workOrders.filter(w => {
    if (selectedMonthFilter === 'all') return true;
    if (!w.plannedDate) return false;
    const [year, month] = selectedMonthFilter.split('-');
    const wDate = new Date(w.plannedDate + 'T00:00:00');
    return wDate.getFullYear() === parseInt(year) && (wDate.getMonth() + 1) === parseInt(month);
  });

  // Overall Statistics
  const totalOrders = filteredWorkOrders.length + filteredAssignments.length;
  const unassigned = filteredWorkOrders.filter(w => w.status === 'unassigned').length;
  const assigned = filteredWorkOrders.filter(w => w.status === 'assigned').length;
  const totalHours = filteredAssignments.reduce((s, a) => s + a.duration, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayAssignments = filteredAssignments.filter(a => a.date === today);

  // Priority breakdown
  const allItems = [...filteredWorkOrders, ...filteredAssignments];
  const priorityCounts = ['critical', 'high', 'medium', 'low'].map(p => ({
    label: priorityLabels[p],
    color: priorityColors[p],
    count: allItems.filter(i => i.priority === p).length,
  }));
  const maxPriority = Math.max(...priorityCounts.map(p => p.count), 1);

  // Personnel workload and statistics
  const personnelStats = personnel.map(p => {
    const todayHours = todayAssignments.filter(a => a.personnelId === p.id).reduce((s, a) => s + a.duration, 0);
    const pAssignments = filteredAssignments.filter(a => a.personnelId === p.id);
    const totalPersonHours = pAssignments.reduce((s, a) => s + a.duration, 0);
    
    // Status counts
    const totalTasks = pAssignments.length;
    const completedTasks = pAssignments.filter(a => a.status === 'completed').length;
    const pendingTasks = pAssignments.filter(a => a.status !== 'completed').length;
    
    const completedHours = pAssignments.filter(a => a.status === 'completed').reduce((s, a) => s + a.duration, 0);
    const pendingHours = pAssignments.filter(a => a.status !== 'completed').reduce((s, a) => s + a.duration, 0);

    const { firstName, lastName } = splitName(p.name);

    return { 
      ...p, 
      firstName,
      lastName,
      todayHours, 
      totalPersonHours,
      totalTasks,
      completedTasks,
      pendingTasks,
      completedHours,
      pendingHours
    };
  }).sort((a, b) => b.totalPersonHours - a.totalPersonHours);

  const maxLoad = Math.max(...personnelStats.map(p => p.totalPersonHours), 1);

  const statCards = [
    { label: 'Toplam İş Emri', value: totalOrders, icon: 'activity-items', scheme: 'None' },
    { label: 'Atanmamış', value: unassigned, icon: 'message-information', scheme: '1' },
    { label: 'Atanmış', value: assigned, icon: 'sys-enter-2', scheme: '6' },
    { label: 'Toplam Saat', value: totalHours, icon: 'time-entry-request', scheme: '2' },
    { label: 'Personel Sayısı', value: personnel.length, icon: 'group', scheme: 'None' },
    { label: 'Bugünü Atama', value: todayAssignments.length, icon: 'calendar', scheme: '3' },
  ];

  // Daily status details
  const assignmentsByDate: Record<string, Assignment[]> = {};
  filteredAssignments.forEach(a => {
    if (!assignmentsByDate[a.date]) {
      assignmentsByDate[a.date] = [];
    }
    assignmentsByDate[a.date].push(a);
  });
  const sortedDates = Object.keys(assignmentsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Weekly grouping
  const weeklyGroups: Record<string, { label: string; assignments: Assignment[]; mondayTime: number }> = {};
  filteredAssignments.forEach(a => {
    const range = getWeekRange(a.date);
    if (!weeklyGroups[range.key]) {
      weeklyGroups[range.key] = { label: range.label, assignments: [], mondayTime: range.mondayTime };
    }
    weeklyGroups[range.key].assignments.push(a);
  });
  const sortedWeeks = Object.values(weeklyGroups).sort((a, b) => a.mondayTime - b.mondayTime);

  // Monthly grouping
  const monthlyGroups: Record<string, { label: string; assignments: Assignment[]; monthTime: number }> = {};
  filteredAssignments.forEach(a => {
    const info = getMonthLabel(a.date);
    if (!monthlyGroups[info.key]) {
      monthlyGroups[info.key] = { label: info.label, assignments: [], monthTime: info.time };
    }
    monthlyGroups[info.key].assignments.push(a);
  });
  const sortedMonths = Object.values(monthlyGroups).sort((a, b) => a.monthTime - b.monthTime);

  // Filtered lists based on sub-filters
  const displayedDates = sortedDates.filter(d => selectedDayFilter === 'all' || d === selectedDayFilter);
  const displayedWeeks = sortedWeeks.filter(w => selectedWeekFilter === 'all' || w.label === selectedWeekFilter);

  // Filtered personnel for Personnel Tab
  const filteredPersonnel = personnelStats.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected Personnel Details
  const selectedPerson = personnelStats.find(p => p.id === selectedPersonnelId);
  const selectedPersonAssignments = selectedPersonnelId 
    ? filteredAssignments.filter(a => a.personnelId === selectedPersonnelId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  return (
    <div className="reports-page" style={{ backgroundColor: 'var(--sapBackgroundColor)', padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      {/* Header and Global period dropdown */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: 'var(--sapTextColor)', margin: 0 }}>Raporlar</h2>
          <p style={{ color: 'var(--sapContent_LabelColor)', margin: '4px 0 0 0' }}>Sistem genel izleme ve personel raporları</p>
        </div>

        {/* Period Selector Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--sapContent_LabelColor)', fontWeight: '600' }}>Dönem Seçimi:</span>
          <select
            value={selectedMonthFilter}
            onChange={(e) => {
              setSelectedMonthFilter(e.target.value);
              setSelectedPersonnelId(null);
              setSelectedDayFilter('all');
              setSelectedWeekFilter('all');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--sapList_BorderColor)',
              backgroundColor: 'var(--sapField_Background)',
              color: 'var(--sapField_TextColor)',
              fontSize: '0.85rem',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tüm Dönemler</option>
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="reports-tab-bar">
        <button
          className={`reports-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Icon name="calendar" style={{ marginRight: '6px', width: '14px', height: '14px' }} />
          Takvim Bazında Genel Durum
        </button>
        <button
          className={`reports-tab-btn ${activeTab === 'personnel' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('personnel');
            setSelectedPersonnelId(null);
          }}
        >
          <Icon name="group" style={{ marginRight: '6px', width: '14px', height: '14px' }} />
          Kişi Bazında Durum
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Stat Cards */}
            <div className="stat-cards-grid">
              {statCards.map((s) => (
                <Card key={s.label} style={{ width: '100%', height: '100px' }}>
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
              ))}
            </div>

            <div className="reports-grid" style={{ marginBottom: '24px' }}>
              {/* Priority distribution */}
              <Card style={{ width: '100%' }}>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--sapTextColor)' }}>Öncelik Dağılımı</h3>
                  {allItems.length === 0 ? (
                    <div className="empty-report">Seçili dönemde kayıtlı iş bulunamadı.</div>
                  ) : (
                    <div className="bar-chart">
                      {priorityCounts.map(p => (
                        <div key={p.label} className="bar-row">
                          <span className="bar-label">{p.label}</span>
                          <div className="bar-track">
                            <motion.div
                              className="bar-fill"
                              style={{ height: '100%', background: p.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(p.count / maxPriority) * 100}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="bar-count">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Personnel workload */}
              <Card style={{ width: '100%' }}>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--sapTextColor)' }}>Personel İş Yükü (Toplam Saat)</h3>
                  {totalHours === 0 ? (
                    <div className="empty-report">Seçili dönemde personel iş yükü bulunmamaktadır.</div>
                  ) : (
                    <div className="bar-chart">
                      {personnelStats.slice(0, 5).filter(p => p.totalPersonHours > 0).map(p => (
                        <div key={p.id} className="bar-row">
                          <span className="bar-label" style={{ width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                          <div className="bar-track">
                            <motion.div
                              className="bar-fill"
                              style={{ height: '100%', background: p.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(p.totalPersonHours / maxLoad) * 100}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="bar-count" style={{ width: '40px' }}>{p.totalPersonHours}s</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Calendar basis - grouped dates/weeks/months status */}
            <Card style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Takvim Planı Dağılımı</h3>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Daily Sub-Filter */}
                    {timeFilter === 'daily' && sortedDates.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', fontWeight: '500' }}>Gün Seçimi:</span>
                        <select
                          value={selectedDayFilter}
                          onChange={(e) => setSelectedDayFilter(e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--sapList_BorderColor)',
                            backgroundColor: 'var(--sapField_Background)',
                            color: 'var(--sapField_TextColor)',
                            fontSize: '0.8rem',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">Tüm Günler</option>
                          {sortedDates.map(dateStr => (
                            <option key={dateStr} value={dateStr}>
                              {new Date(dateStr + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Weekly Sub-Filter */}
                    {timeFilter === 'weekly' && sortedWeeks.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', fontWeight: '500' }}>Hafta Seçimi:</span>
                        <select
                          value={selectedWeekFilter}
                          onChange={(e) => setSelectedWeekFilter(e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--sapList_BorderColor)',
                            backgroundColor: 'var(--sapField_Background)',
                            color: 'var(--sapField_TextColor)',
                            fontSize: '0.8rem',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">Tüm Haftalar</option>
                          {sortedWeeks.map(w => (
                            <option key={w.label} value={w.label}>
                              {w.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Time Filter Toggle */}
                    <div className="time-filter-toggle">
                      <button
                        className={`filter-toggle-btn ${timeFilter === 'daily' ? 'active' : ''}`}
                        onClick={() => {
                          setTimeFilter('daily');
                          setSelectedDayFilter('all');
                        }}
                      >
                        Günlük
                      </button>
                      <button
                        className={`filter-toggle-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
                        onClick={() => {
                          setTimeFilter('weekly');
                          setSelectedWeekFilter('all');
                        }}
                      >
                        Haftalık
                      </button>
                      <button
                        className={`filter-toggle-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('monthly')}
                      >
                        Aylık
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {timeFilter === 'daily' && (
                    <motion.div
                      key="daily-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="date-groups-container"
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      {displayedDates.length === 0 ? (
                        <div className="empty-report">Seçili kriterlerde takvime atanmış herhangi bir iş bulunmuyor.</div>
                      ) : (
                        displayedDates.map(dateStr => {
                          const dateAssignments = assignmentsByDate[dateStr];
                          const totalDailyHours = dateAssignments.reduce((sum, a) => sum + a.duration, 0);
                          const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          
                          return (
                            <div key={dateStr} className="date-group-card" style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '8px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sapList_BorderColor)', paddingBottom: '8px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--sapTextColor)', fontSize: '0.9rem' }}>{formattedDate}</span>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                                  <span>İş Adedi: <strong>{dateAssignments.length}</strong></span>
                                  <span>Toplam Süre: <strong>{totalDailyHours} saat</strong></span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {dateAssignments.map(a => {
                                  const p = personnel.find(x => x.id === a.personnelId);
                                  return (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {p && <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '20px', height: '20px', fontSize: '8px' }} />}
                                        <span style={{ fontWeight: '500', color: 'var(--sapTextColor)' }}>{p?.name}:</span>
                                        <span style={{ color: 'var(--sapTextColor)' }}>{a.title}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--sapContent_LabelColor)' }}>{String(a.startHour).padStart(2,'0')}:00 ({a.duration} sa)</span>
                                        <span className={`status-badge status-${a.status}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                                          {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}

                  {timeFilter === 'weekly' && (
                    <motion.div
                      key="weekly-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="date-groups-container"
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      {displayedWeeks.length === 0 ? (
                        <div className="empty-report">Seçili kriterlerde takvime atanmış herhangi bir iş bulunmuyor.</div>
                      ) : (
                        displayedWeeks.map(w => {
                          const totalWeeklyHours = w.assignments.reduce((sum, a) => sum + a.duration, 0);
                          return (
                            <div key={w.label} className="date-group-card" style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '8px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sapList_BorderColor)', paddingBottom: '8px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--sapTextColor)', fontSize: '0.9rem' }}>{w.label}</span>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                                  <span>İş Adedi: <strong>{w.assignments.length}</strong></span>
                                  <span>Toplam Süre: <strong>{totalWeeklyHours} saat</strong></span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {w.assignments.map(a => {
                                  const p = personnel.find(x => x.id === a.personnelId);
                                  const formattedDay = new Date(a.date + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
                                  return (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--sapContent_LabelColor)', width: '68px', display: 'inline-block' }}>{formattedDay}</span>
                                        {p && <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '20px', height: '20px', fontSize: '8px' }} />}
                                        <span style={{ fontWeight: '500', color: 'var(--sapTextColor)' }}>{p?.name}:</span>
                                        <span style={{ color: 'var(--sapTextColor)' }}>{a.title}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--sapContent_LabelColor)' }}>{String(a.startHour).padStart(2,'0')}:00 ({a.duration} sa)</span>
                                        <span className={`status-badge status-${a.status}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                                          {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}

                  {timeFilter === 'monthly' && (
                    <motion.div
                      key="monthly-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="date-groups-container"
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      {sortedMonths.length === 0 ? (
                        <div className="empty-report">Seçili dönemde takvime atanmış herhangi bir iş bulunmuyor.</div>
                      ) : (
                        sortedMonths.map(m => {
                          const totalMonthlyHours = m.assignments.reduce((sum, a) => sum + a.duration, 0);
                          return (
                            <div key={m.label} className="date-group-card" style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '8px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sapList_BorderColor)', paddingBottom: '8px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--sapTextColor)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{m.label}</span>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                                  <span>İş Adedi: <strong>{m.assignments.length}</strong></span>
                                  <span>Toplam Süre: <strong>{totalMonthlyHours} saat</strong></span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {m.assignments.map(a => {
                                  const p = personnel.find(x => x.id === a.personnelId);
                                  const formattedDay = new Date(a.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                                  return (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--sapContent_LabelColor)', width: '50px', display: 'inline-block' }}>{formattedDay}</span>
                                        {p && <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '20px', height: '20px', fontSize: '8px' }} />}
                                        <span style={{ fontWeight: '500', color: 'var(--sapTextColor)' }}>{p?.name}:</span>
                                        <span style={{ color: 'var(--sapTextColor)' }}>{a.title}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--sapContent_LabelColor)' }}>{String(a.startHour).padStart(2,'0')}:00 ({a.duration} sa)</span>
                                        <span className={`status-badge status-${a.status}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                                          {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'personnel' && (
          <motion.div
            key="personnel-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {!selectedPersonnelId ? (
              // Personnel Table List View
              <Card style={{ width: '100%', marginBottom: '24px' }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Personel İzleme Raporu</h3>
                    <input
                      type="text"
                      placeholder="Personel veya Rol Ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--sapList_BorderColor)',
                        backgroundColor: 'var(--sapField_Background)',
                        color: 'var(--sapField_TextColor)',
                        fontSize: '0.85rem',
                        width: '240px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="personnel-report-table">
                      <thead>
                        <tr>
                          <th>Adı</th>
                          <th>Soyadı</th>
                          <th>Grup / Rol</th>
                          <th style={{ textAlign: 'center' }}>Toplam İş</th>
                          <th style={{ textAlign: 'center' }}>Toplam Süre (Saat)</th>
                          <th style={{ textAlign: 'center' }}>Tamamlanan (Saat)</th>
                          <th style={{ textAlign: 'center' }}>Bekleyen (Saat)</th>
                          <th style={{ textAlign: 'center' }}>Detay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPersonnel.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--sapContent_LabelColor)' }}>Aranan kriterlere uygun personel bulunamadı.</td>
                          </tr>
                        ) : (
                          filteredPersonnel.map((p) => (
                            <tr key={p.id} className="personnel-table-row">
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '28px', height: '28px', fontSize: '11px' }} />
                                  <span style={{ fontWeight: '500' }}>{p.firstName}</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: '500' }}>{p.lastName}</td>
                              <td style={{ color: 'var(--sapContent_LabelColor)' }}>{p.role}</td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.totalTasks}</td>
                              <td style={{ textAlign: 'center' }}>{p.totalPersonHours} sa</td>
                              <td style={{ textAlign: 'center', color: '#16A34A', fontWeight: 'bold' }}>{p.completedHours} sa</td>
                              <td style={{ textAlign: 'center', color: '#D97706', fontWeight: 'bold' }}>{p.pendingHours} sa</td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => setSelectedPersonnelId(p.id)}
                                  className="detail-action-btn"
                                >
                                  Detay <Icon name="slim-arrow-right" style={{ width: '12px', height: '12px' }} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            ) : (
              // Drill-Down Person Detail Report View (Inside the same Personnel tab)
              <div>
                {/* Back button and profile header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setSelectedPersonnelId(null)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--sapList_BorderColor)',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      color: 'var(--sapTextColor)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(255,255,255,0.04)'
                    }}
                  >
                    <span>← Listeye Dön</span>
                  </button>
                  <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>
                    Kişi detay raporu inceleniyor
                  </span>
                </div>

                {selectedPerson && (
                  <>
                    <Card style={{ width: '100%', marginBottom: '20px' }}>
                      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                        <Avatar initials={selectedPerson.avatar} colorScheme="Accent6" style={{ backgroundColor: selectedPerson.color, width: '64px', height: '64px', fontSize: '24px' }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--sapTextColor)' }}>{selectedPerson.name}</h3>
                          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--sapContent_LabelColor)' }}>
                            <span>Grup/Rol: <strong style={{ color: 'var(--sapTextColor)' }}>{selectedPerson.role}</strong></span>
                            {selectedPerson.workCenter && <span>Atölye: <strong style={{ color: 'var(--sapTextColor)' }}>{selectedPerson.workCenter}</strong></span>}
                            <span>Günlük Kapasite: <strong style={{ color: 'var(--sapTextColor)' }}>{selectedPerson.capacity} saat</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {selectedPerson.skills.map(s => (
                              <Tag key={s} colorScheme="4" style={{ fontSize: '10px' }}>{s}</Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Specific Personal Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      <Card style={{ height: '90px' }}>
                        <div style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>Toplam Atanan İş</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '4px', color: 'var(--sapTextColor)' }}>{selectedPerson.totalTasks} Adet</div>
                        </div>
                      </Card>
                      <Card style={{ height: '90px' }}>
                        <div style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>Toplam İş Süresi</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '4px', color: 'var(--sapTextColor)' }}>{selectedPerson.totalPersonHours} Saat</div>
                        </div>
                      </Card>
                      <Card style={{ height: '90px' }}>
                        <div style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#16A34A' }}>Tamamlanan Süre</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '4px', color: '#16A34A' }}>{selectedPerson.completedHours} Saat</div>
                        </div>
                      </Card>
                      <Card style={{ height: '90px' }}>
                        <div style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#D97706' }}>Bekleyen Süre</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '4px', color: '#D97706' }}>{selectedPerson.pendingHours} Saat</div>
                        </div>
                      </Card>
                    </div>

                    {/* Specific Personal Work Orders */}
                    <Card style={{ width: '100%', marginBottom: '24px' }}>
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--sapTextColor)' }}>Atanmış İş Emirleri Detayı</h4>
                        {selectedPersonAssignments.length === 0 ? (
                          <div className="empty-report">Bu dönemde personele atanmış herhangi bir iş emri bulunmuyor.</div>
                        ) : (
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'var(--sapList_HeaderBackground)', borderBottom: '2px solid var(--sapList_BorderColor)', color: 'var(--sapTextColor)', fontWeight: 'bold' }}>
                                  <th style={{ padding: '10px 12px' }}>Tarih</th>
                                  <th style={{ padding: '10px 12px' }}>Saat</th>
                                  <th style={{ padding: '10px 12px' }}>Süre</th>
                                  <th style={{ padding: '10px 12px' }}>İş Emri Başlığı</th>
                                  <th style={{ padding: '10px 12px' }}>Ekipman</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Öncelik</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Durum</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPersonAssignments.map((a, idx) => (
                                  <tr key={a.id} style={{ borderBottom: idx < selectedPersonAssignments.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none', color: 'var(--sapTextColor)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>
                                      {new Date(a.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>{String(a.startHour).padStart(2, '0')}:00</td>
                                    <td style={{ padding: '10px 12px' }}>{a.duration} saat</td>
                                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{a.title}</td>
                                    <td style={{ padding: '10px 12px' }}>{a.equipment}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        backgroundColor: priorityColors[a.priority] + '20',
                                        color: priorityColors[a.priority]
                                      }}>
                                        {priorityLabels[a.priority]}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                      <span className={`status-badge status-${a.status}`} style={{ fontSize: '10px' }}>
                                        {a.status === 'confirmed' ? 'Onaylı' : a.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
