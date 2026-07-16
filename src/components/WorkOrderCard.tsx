import type { WorkOrder } from '../types';
import { Card, Tag, Icon, FlexBox } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import '@ui5/webcomponents-icons/dist/wrench.js';
import '@ui5/webcomponents-icons/dist/product.js';
import '@ui5/webcomponents-icons/dist/locate-me.js';
import { motion } from 'framer-motion';

interface WorkOrderCardProps {
  order: WorkOrder;
  index: number;
}

const priorityScheme: Record<string, string> = {
  critical: '1',
  high:     '2',
  medium:   '6',
  low:      '3',
};

const priorityLabels: Record<string, string> = {
  critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük',
};

export default function WorkOrderCard({ order, index }: WorkOrderCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('workOrder', JSON.stringify(order));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -1 }}
    >
      <div 
        className={`work-order-card priority-${order.priority}`} 
        draggable 
        onDragStart={handleDragStart}
        style={{ cursor: 'grab', marginBottom: '8px' }}
      >
        <Card style={{ width: '100%' }}>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FlexBox justifyContent="SpaceBetween" alignItems="Center">
              <span style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)', fontWeight: 'bold' }}>{order.id}</span>
              <Tag colorScheme={priorityScheme[order.priority]}>
                {priorityLabels[order.priority]}
              </Tag>
            </FlexBox>

            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--sapTextColor)', display: 'block' }}>
              {order.title}
            </span>

            <FlexBox alignItems="Center" style={{ gap: '6px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
              <Icon name="time-entry-request" style={{ width: '12px', height: '12px' }} />
              {order.startHour !== null ? (
                <span>
                  <strong>{String(order.startHour).padStart(2,'0')}:00 – {String(order.startHour + order.duration).padStart(2,'0')}:00</strong> ({order.duration}s)
                </span>
              ) : (
                <span>Süre: <strong>{order.duration} saat</strong></span>
              )}
            </FlexBox>

            <FlexBox wrap="Wrap" style={{ gap: '8px', marginTop: '4px', borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '8px' }}>
              <FlexBox alignItems="Center" style={{ gap: '4px', fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>
                <Icon name="wrench" style={{ width: '10px', height: '10px' }} />
                <span>{order.requiredSkill}</span>
              </FlexBox>
              <FlexBox alignItems="Center" style={{ gap: '4px', fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>
                <Icon name="product" style={{ width: '10px', height: '10px' }} />
                <span>{order.equipment}</span>
              </FlexBox>
              <FlexBox alignItems="Center" style={{ gap: '4px', fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>
                <Icon name="locate-me" style={{ width: '10px', height: '10px' }} />
                <span>{order.location}</span>
              </FlexBox>
            </FlexBox>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
