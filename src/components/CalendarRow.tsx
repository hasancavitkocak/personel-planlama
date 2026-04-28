import { useState } from 'react';
import type { Personnel, Assignment, WorkOrder } from '../types';
import { motion } from 'framer-motion';
import AssignmentBlock from './AssignmentBlock';
import './CalendarRow.css';

interface CalendarRowProps {
  person: Personnel;
  assignments: Assignment[];
  onAssign: (workOrder: WorkOrder | Assignment, personnelId: string, startHour: number) => void;
  onRemoveAssignment: (assignmentId: string) => void;
  index: number;
}

export default function CalendarRow({ person, assignments, onAssign, onRemoveAssignment, index }: CalendarRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const workOrderData = e.dataTransfer.getData('workOrder');
    if (!workOrderData) return;
    const workOrder = JSON.parse(workOrderData);
    const timeline = e.currentTarget.querySelector('.row-timeline') as HTMLElement;
    const rect = timeline.getBoundingClientRect();
    const hour = Math.floor(((e.clientX - rect.left) / rect.width) * 24);
    onAssign(workOrder, person.id, Math.max(0, Math.min(23, hour)));
  };

  return (
    <motion.div
      className={`calendar-row ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="row-personnel">
        <div className="personnel-avatar" style={{ background: person.color }}>
          {person.avatar}
        </div>
        <div className="personnel-info">
          <h4>{person.name}</h4>
          <p>{person.role}</p>
        </div>
      </div>

      <div className="row-timeline">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="timeline-cell" />
        ))}
        {assignments.map(assignment => (
          <AssignmentBlock
            key={assignment.id}
            assignment={assignment}
            onReassign={onAssign}
            onRemove={onRemoveAssignment}
          />
        ))}
      </div>
    </motion.div>
  );
}
