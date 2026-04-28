import { useState, useEffect } from 'react';
import type { WorkOrder } from '../types';
import { X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './WorkOrderModal.css';

interface WorkOrderModalProps {
  workOrder: WorkOrder | null;
  onSave: (workOrder: WorkOrder) => void;
  onClose: () => void;
}

export default function WorkOrderModal({ workOrder, onSave, onClose }: WorkOrderModalProps) {
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    id: '', title: '', description: '', priority: 'medium',
    requiredSkill: '', duration: 4, equipment: '', location: '',
    status: 'unassigned', plannedDate: null, assignedTo: null,
    startHour: null, orderType: 'PM01'
  });

  // Planned start hour — separate state, optional
  const [plannedStart, setPlannedStart] = useState<number | ''>('');

  useEffect(() => {
    if (workOrder) {
      setFormData(workOrder);
      setPlannedStart(workOrder.startHour ?? '');
    } else {
      const nextId = `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      setFormData(prev => ({ ...prev, id: nextId }));
      setPlannedStart('');
    }
  }, [workOrder]);

  const endHour = plannedStart !== '' ? (plannedStart as number) + (formData.duration ?? 0) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startHour: plannedStart !== '' ? plannedStart as number : null,
    } as WorkOrder);
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{workOrder ? 'İş Emrini Düzenle' : 'Yeni İş Emri'}</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <form className="modal-body" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>İş Emri No</label>
                <input type="text" className="form-control" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Öncelik</label>
                <select className="form-control" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} required>
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Başlık</label>
              <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <textarea className="form-control" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>

            {/* Time planning section */}
            <div className="time-section">
              <div className="time-section-title"><Clock size={14} /> Zaman Planlaması</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Süre (Saat)</label>
                  <select className="form-control" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} required>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <option key={h} value={h}>{h} saat</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Planlanan Başlangıç <span className="optional-tag">isteğe bağlı</span></label>
                  <select className="form-control" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value === '' ? '' : parseInt(e.target.value))}>
                    <option value="">Takvimde belirle</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time preview */}
              {plannedStart !== '' && endHour !== null && (
                <motion.div className="time-preview" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <Clock size={14} />
                  <span>
                    <strong>{String(plannedStart).padStart(2, '0')}:00</strong>
                    {' → '}
                    <strong>{String(endHour).padStart(2, '0')}:00</strong>
                  </span>
                  <span className="time-preview-badge">{formData.duration} saat</span>
                  {endHour > 24 && <span className="time-preview-warn">⚠️ 24:00'ü geçiyor!</span>}
                </motion.div>
              )}

              {plannedStart === '' && (
                <div className="time-hint">
                  💡 Başlangıç saati seçmezseniz, iş emrini takvimde istediğiniz saate sürükleyerek atayabilirsiniz.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Gerekli Yetkinlik</label>
              <input type="text" className="form-control" value={formData.requiredSkill} onChange={(e) => setFormData({ ...formData, requiredSkill: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ekipman</label>
                <input type="text" className="form-control" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Lokasyon</label>
                <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={endHour !== null && endHour > 24}>Kaydet</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
