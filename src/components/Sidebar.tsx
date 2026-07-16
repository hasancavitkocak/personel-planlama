import { useState } from 'react';
import type { User, WorkOrder, Assignment, Personnel, PlanningCalendar } from '../types';
import { Card, Tag, Icon, FlexBox, Avatar, MessageStrip } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/message-information.js';
import { motion, AnimatePresence } from 'framer-motion';
import WorkOrderCard from './WorkOrderCard';
import './Sidebar.css';

interface SidebarProps {
  user: User;
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
  onRemoveAssignment: (assignmentId: string) => void;
  activeCalendarId?: string | null;
  calendars?: PlanningCalendar[];
}

export default function Sidebar({
  user,
  workOrders,
  assignments,
  personnel,
  onRemoveAssignment,
  activeCalendarId,
  calendars
}: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const activeCal = calendars?.find(c => c.id === activeCalendarId) || null;
  const calendarWoIds = activeCal ? activeCal.workOrderIds : [];

  const unassignedOrders = activeCal 
    ? workOrders.filter(wo => calendarWoIds.includes(wo.id))
    : workOrders.filter(wo => wo.status === 'unassigned');

  const todayAssignments = assignments.filter(a => a.date === new Date().toISOString().split('T')[0]);

  const stats = [
    { label: 'İş Emri', value: workOrders.length + assignments.length, icon: 'activity-items' },
    { label: 'Atanmamış', value: unassignedOrders.length, icon: 'message-information' },
    { label: 'Personel', value: personnel.length, icon: 'group' },
    { label: 'Bugün', value: todayAssignments.length, icon: 'calendar' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
    if ('workOrderId' in dropped && dropped.workOrderId) {
      onRemoveAssignment(dropped.id);
    }
  };

  return (
    <aside className="sidebar" style={{ backgroundColor: 'var(--sapBackgroundColor)', borderRight: '1px solid var(--sapList_BorderColor)' }}>
      <div className="sidebar-header" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FlexBox alignItems="Center" style={{ gap: '12px' }}>
          <Avatar initials={user.name.split(' ').map(n => n[0]).join('')} colorScheme="Accent6" style={{ width: '45px', height: '45px' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>{user.name}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>{user.role}</p>
          </div>
        </FlexBox>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {stats.map((stat) => (
            <Card key={stat.label} style={{ height: '70px' }}>
              <FlexBox direction="Column" justifyContent="Center" style={{ height: '100%', padding: '8px' }}>
                <FlexBox alignItems="Center" style={{ gap: '4px', fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>
                  <Icon name={stat.icon} style={{ width: '12px', height: '12px' }} />
                  <span>{stat.label}</span>
                </FlexBox>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--sapTextColor)', marginTop: '4px' }}>
                  {stat.value}
                </div>
              </FlexBox>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 12px 16px' }}>
        <MessageStrip design="Information" hideCloseButton>
          İş emirlerini takvime sürükleyin. Atamayı geri almak için buraya geri sürükleyin.
        </MessageStrip>
      </div>

      <div
        className={`work-orders-section ${isDragOver ? 'drop-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 16px 16px 16px',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ marginBottom: '12px' }}>
          <FlexBox alignItems="Center" style={{ gap: '6px', fontWeight: 'bold', color: 'var(--sapTextColor)', fontSize: '0.85rem' }}>
            <Icon name="activity-items" style={{ width: '14px', height: '14px' }} />
            <span>{activeCal ? `${activeCal.name} İşleri` : 'Atanmamış İş Emirleri'}</span>
          </FlexBox>
          <Tag colorScheme="6">{unassignedOrders.length}</Tag>
        </FlexBox>

        <AnimatePresence>
          {isDragOver && (
            <motion.div
              className="unassign-drop-zone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 16,
                right: 16,
                bottom: 16,
                background: 'rgba(239, 246, 255, 0.9)',
                border: '2px dashed var(--sapContent_SelectedColor)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                color: 'var(--sapContent_SelectedColor)',
                gap: '8px',
                fontWeight: 'bold'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🔄</span>
              <span>Atamayı kaldırmak için bırakın</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="work-orders-list" style={{ flex: 1, overflowY: 'auto' }}>
          {unassignedOrders.length === 0 && !isDragOver ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>
              🎉 Tüm iş emirleri atandı!
            </div>
          ) : (
            unassignedOrders.map((order, index) => (
              <WorkOrderCard key={order.id} order={order} index={index} />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
