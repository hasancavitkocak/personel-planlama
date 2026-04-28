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
  const [hoverHour, setHoverHour] = useState<number | null>(null);
  const [dragDuration, setDragDuration] = useState<number>(1);

  const getHourFromEvent = (e: React.DragEvent): number => {
    const timeline = e.currentTarget.querySelector('.row-timeline') as HTMLElement;
    const rect = timeline.getBoundingClientRect();
    return Math.max(0, Math.min(23, Math.floor(((e.clientX - rect.left) / rect.width) * 24)));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    const hour = getHourFromEvent(e);
    setHoverHour(hour);
    // Try to read duration from drag data
    try {
      const data = e.dataTransfer.getData('workOrder');
      if (data) setDragDuration(JSON.parse(data).duration ?? 1);
    } catch { /* ignore */ }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setHoverHour(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setHoverHour(null);
    const workOrderData = e.dataTransfer.getData('workOrder');
    if (!workOrderData) return;
    const workOrder = JSON.parse(workOrderData);
    const hour = getHourFromEvent(e);
    onAssign(workOrder, person.id, Math.max(0, Math.min(23, hour)));
  };

  const previewLeft = hoverHour !== null ? (hoverHour / 24) * 100 : 0;
  const previewWidth = (dragDuration / 24) * 100;
  const previewEnd = hoverHour !== null ? hoverHour + dragDuration : 0;

  return (
    <motion.div
      className={`calendar-row ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
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
        {/* Drop preview ghost */}
        {isDragOver && hoverHour !== null && (
          <div
            className="drop-preview"
            style={{ left: `${previewLeft}%`, width: `${previewWidth}%` }}
          >
            <span className="drop-preview-label">
              {String(hoverHour).padStart(2,'0')}:00 – {String(previewEnd).padStart(2,'0')}:00
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
