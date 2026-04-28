import { useState } from 'react';
import type { Assignment } from '../types';
import { X, Clock, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AssignmentEditModal.css';

interface AssignmentEditModalProps {
  assignment: Assignment;
  onSave: (startHour: number, duration: number) => void;
  onClose: () => void;
}

const priorityLabels: Record<string, string> = {
  critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük',
};

export default function AssignmentEditModal({ assignment, onSave, onClose }: AssignmentEditModalProps) {
  const [startHour, setStartHour] = useState(assignment.startHour);
  const [duration, setDuration] = useState(assignment.duration);

  const endHour = startHour + duration;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endHour > 24) {
      alert('Bitiş saati 24:00\'ü geçemez.');
      return;
    }
    onSave(startHour, duration);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal ae-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="ae-header-content">
              <Pencil size={16} />
              <h3>Atamayı Düzenle</h3>
            </div>
            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>

          <form className="modal-body" onSubmit={handleSubmit}>
            <div className="ae-info-row">
              <span className="ae-title">{assignment.title}</span>
              <span className={`priority-badge priority-${assignment.priority}`}>
                {priorityLabels[assignment.priority]}
              </span>
            </div>
            <div className="ae-sub">{assignment.workOrderId} · {assignment.equipment}</div>

            <div className="ae-time-preview">
              <Clock size={16} />
              <span className="ae-time-text">
                {String(startHour).padStart(2,'0')}:00
                <span className="ae-arrow"> → </span>
                {String(endHour).padStart(2,'0')}:00
              </span>
              <span className="ae-duration-badge">{duration} saat</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Başlangıç Saati</label>
                <select
                  className="form-control"
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Süre (Saat)</label>
                <select
                  className="form-control"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h} saat</option>
                  ))}
                </select>
              </div>
            </div>

            {endHour > 24 && (
              <div className="ae-warning">⚠️ Bitiş saati 24:00'ü geçiyor!</div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={endHour > 24}>Kaydet</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
