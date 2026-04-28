import { useState, useRef } from 'react';
import type { Assignment, WorkOrder } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import './AssignmentBlock.css';

interface AssignmentBlockProps {
  assignment: Assignment;
  onReassign: (workOrder: WorkOrder | Assignment, personnelId: string, startHour: number) => void;
  onRemove: (assignmentId: string) => void;
}

const priorityGradients: Record<string, string> = {
  critical: 'linear-gradient(135deg, #BE185D, #9D174D)',
  high:     'linear-gradient(135deg, #DC2626, #B91C1C)',
  medium:   'linear-gradient(135deg, #D97706, #B45309)',
  low:      'linear-gradient(135deg, #16A34A, #15803D)',
};

const priorityLabels: Record<string, string> = {
  critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük',
};

export default function AssignmentBlock({ assignment }: AssignmentBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const left = (assignment.startHour / 24) * 100;
  const width = (assignment.duration / 24) * 100;
  const endHour = assignment.startHour + assignment.duration;

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => setShowTooltip(false), 150);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('workOrder', JSON.stringify(assignment));
    e.dataTransfer.effectAllowed = 'move';
    setShowTooltip(false);
  };

  return (
    <motion.div
      style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, top: 0, bottom: 0, padding: '5px 3px', zIndex: showTooltip ? 20 : 1 }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ scaleX: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="assignment-block"
        draggable
        onDragStart={handleDragStart}
        style={{ background: priorityGradients[assignment.priority] }}
      >
        <div className="assignment-title">{assignment.title}</div>
        <div className="assignment-time">
          {String(assignment.startHour).padStart(2, '0')}:00 – {String(endHour).padStart(2, '0')}:00
        </div>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="assignment-tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tooltip-header">
              <span className="tooltip-title">{assignment.title}</span>
              <span className={`tooltip-badge priority-${assignment.priority}`}>
                {priorityLabels[assignment.priority]}
              </span>
            </div>
            <div className="tooltip-row">🕐 {String(assignment.startHour).padStart(2,'0')}:00 – {String(endHour).padStart(2,'0')}:00 ({assignment.duration} saat)</div>
            <div className="tooltip-row">🔧 {assignment.equipment}</div>
            <div className="tooltip-row">📋 {assignment.workOrderId}</div>
            <div className={`tooltip-status status-${assignment.status}`}>
              {assignment.status === 'confirmed' ? '✅ Onaylandı' : assignment.status === 'pending' ? '⏳ Bekliyor' : '✔ Tamamlandı'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
