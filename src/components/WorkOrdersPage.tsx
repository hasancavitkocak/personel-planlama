import type { WorkOrder, Assignment, Personnel } from '../types';
import { Button, Card, Tag, Icon, FlexBox, Avatar } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/message-information.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import { motion } from 'framer-motion';
import WorkOrderCard from './WorkOrderCard';
import './WorkOrdersPage.css';

interface WorkOrdersPageProps {
  workOrders: WorkOrder[];
  assignments: Assignment[];
  personnel: Personnel[];
  onRemoveAssignment: (id: string) => void;
}

export default function WorkOrdersPage({ workOrders, assignments, personnel, onRemoveAssignment }: WorkOrdersPageProps) {
  const unassigned = workOrders.filter(w => w.status === 'unassigned');
  const assigned = workOrders.filter(w => w.status === 'assigned');

  const getPersonnel = (id: string | null) => personnel.find(p => p.id === id);
  const getAssignment = (workOrderId: string) => assignments.find(a => a.workOrderId === workOrderId);

  return (
    <div className="workorders-page" style={{ backgroundColor: 'var(--sapBackgroundColor)', padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="wo-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Unassigned */}
        <div className="wo-column" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card style={{ width: '100%' }}>
            <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <FlexBox alignItems="Center" style={{ gap: '8px', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
                <Icon name="message-information" style={{ color: 'var(--sapNegativeElementColor)', width: '16px', height: '16px' }} />
                <span>Atanmamış</span>
              </FlexBox>
              <Tag colorScheme="1" hideStateIcon>{unassigned.length}</Tag>
            </FlexBox>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto' }}>
              {unassigned.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>🎉 Tüm iş emirleri atandı!</div>
              ) : (
                unassigned.map((order, i) => <WorkOrderCard key={order.id} order={order} index={i} />)
              )}
            </div>
          </Card>
        </div>

        {/* Assigned */}
        <div className="wo-column" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card style={{ width: '100%' }}>
            <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <FlexBox alignItems="Center" style={{ gap: '8px', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
                <Icon name="activity-items" style={{ color: 'var(--sapSelectedColor)', width: '16px', height: '16px' }} />
                <span>Atanmış</span>
              </FlexBox>
              <Tag colorScheme="6" hideStateIcon>{assigned.length}</Tag>
            </FlexBox>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto' }}>
              {assigned.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>Henüz atanmış iş emri yok.</div>
              ) : (
                assigned.map((order, i) => {
                  const p = getPersonnel(order.assignedTo);
                  const asgn = getAssignment(order.id);
                  const startH = asgn?.startHour ?? order.startHour;
                  const endH = startH !== null ? startH + order.duration : null;
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card style={{ width: '100%' }}>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <FlexBox justifyContent="SpaceBetween" alignItems="Center">
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--sapContent_LabelColor)' }}>{order.id}</span>
                            <Tag colorScheme="6" hideStateIcon>Atanmış</Tag>
                          </FlexBox>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--sapTextColor)' }}>{order.title}</span>
                          <FlexBox wrap="Wrap" style={{ gap: '12px', borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '8px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                            {p && (
                              <FlexBox alignItems="Center" style={{ gap: '6px' }}>
                                <Avatar initials={p.name.split(' ').map(x=>x[0]).join('')} colorScheme="Accent6" style={{ width: '20px', height: '20px' }} />
                                <span>{p.name}</span>
                              </FlexBox>
                            )}
                            {(asgn?.date ?? order.plannedDate) && (
                              <FlexBox alignItems="Center" style={{ gap: '4px' }}>
                                <Icon name="calendar" style={{ width: '12px', height: '12px' }} />
                                <span>{asgn?.date ?? order.plannedDate}</span>
                              </FlexBox>
                            )}
                            {startH !== null && endH !== null && (
                              <FlexBox alignItems="Center" style={{ gap: '4px' }}>
                                <Icon name="time-entry-request" style={{ width: '12px', height: '12px' }} />
                                <span>{String(startH).padStart(2,'0')}:00 – {String(endH).padStart(2,'0')}:00</span>
                              </FlexBox>
                            )}
                            <span>⏱ {order.duration}s</span>
                          </FlexBox>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Assignments */}
        <div className="wo-column" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Card style={{ width: '100%' }}>
            <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <FlexBox alignItems="Center" style={{ gap: '8px', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
                <Icon name="calendar" style={{ color: 'var(--sapSuccessColor)', width: '16px', height: '16px' }} />
                <span>Takvim Atamaları</span>
              </FlexBox>
              <Tag colorScheme="3" hideStateIcon>{assignments.length}</Tag>
            </FlexBox>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto' }}>
              {assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sapContent_LabelColor)', fontSize: '0.85rem' }}>Henüz takvim ataması yok.</div>
              ) : (
                assignments.map((a, i) => {
                  const p = personnel.find(x => x.id === a.personnelId);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card style={{ width: '100%' }}>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <FlexBox justifyContent="SpaceBetween" alignItems="Center">
                            <FlexBox alignItems="Center" style={{ gap: '6px' }}>
                              {p && <Avatar initials={p.name.split(' ').map(x=>x[0]).join('')} colorScheme="Accent6" style={{ width: '20px', height: '20px' }} />}
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>{p?.name}</span>
                            </FlexBox>
                            <Button design="Transparent" icon="decline" style={{ width: '24px', height: '24px' }} onClick={() => onRemoveAssignment(a.id)} />
                          </FlexBox>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--sapTextColor)' }}>{a.title}</span>
                          <FlexBox wrap="Wrap" style={{ gap: '12px', borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '8px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                            <FlexBox alignItems="Center" style={{ gap: '4px' }}>
                              <Icon name="calendar" style={{ width: '12px', height: '12px' }} />
                              <span>{a.date}</span>
                            </FlexBox>
                            <FlexBox alignItems="Center" style={{ gap: '4px' }}>
                              <Icon name="time-entry-request" style={{ width: '12px', height: '12px' }} />
                              <span>{String(a.startHour).padStart(2,'0')}:00 – {String(a.startHour + a.duration).padStart(2,'0')}:00</span>
                            </FlexBox>
                            <span>⏱ {a.duration}s</span>
                          </FlexBox>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
