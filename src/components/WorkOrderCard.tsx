import type { WorkOrder } from '../types';
import { Clock, Wrench, MapPin, Package, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import './WorkOrderCard.css';

interface WorkOrderCardProps {
  order: WorkOrder;
  index: number;
}

const priorityGradients: Record<string, string> = {
  critical: 'linear-gradient(180deg, #BE185D, #9D174D)',
  high:     'linear-gradient(180deg, #DC2626, #B91C1C)',
  medium:   'linear-gradient(180deg, #D97706, #B45309)',
  low:      'linear-gradient(180deg, #16A34A, #15803D)',
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
      <div className="work-order-card" draggable onDragStart={handleDragStart}>
        <div className="wo-bar" style={{ background: priorityGradients[order.priority] }} />

        <div className="wo-inner">
          <div className="work-order-header">
            <span className="work-order-id">{order.id}</span>
            <span className={`priority-badge priority-${order.priority}`}>
              {priorityLabels[order.priority]}
            </span>
          </div>

          <div className="work-order-title">{order.title}</div>

          {/* Duration pill */}
          <div className="duration-pill">
            <Clock size={11} />
            Tahmini süre: <strong>{order.duration} saat</strong>
          </div>

          <div className="work-order-meta">
            <span className="meta-item"><Wrench size={11} />{order.requiredSkill}</span>
            <span className="meta-item"><Package size={11} />{order.equipment}</span>
            <span className="meta-item"><MapPin size={11} />{order.location}</span>
          </div>
        </div>

        <GripVertical size={14} className="drag-hint" />
      </div>
    </motion.div>
  );
}
