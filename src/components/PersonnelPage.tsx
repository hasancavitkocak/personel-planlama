import { useState } from 'react';
import type { Personnel } from '../types';
import { Plus, Pencil, Trash2, X, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './WorkOrderModal.css';
import './PersonnelPage.css';

interface PersonnelPageProps {
  personnel: Personnel[];
  onAdd: (p: Personnel) => void;
  onUpdate: (p: Personnel) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#007AFF','#34C759','#FF9500','#FF2D55','#5856D6','#FF6B35','#00C7BE','#30B0C7'];

const emptyForm = (): Omit<Personnel, 'id'> => ({
  name: '', role: '', skills: [], capacity: 8, avatar: '', color: COLORS[0]
});

export default function PersonnelPage({ personnel, onAdd, onUpdate, onDelete }: PersonnelPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Personnel | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [skillInput, setSkillInput] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setSkillInput('');
    setShowModal(true);
  };

  const openEdit = (p: Personnel) => {
    setEditing(p);
    setForm({ name: p.name, role: p.role, skills: [...p.skills], capacity: p.capacity, avatar: p.avatar, color: p.color });
    setSkillInput('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    const avatarFallback = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    if (editing) {
      onUpdate({ ...editing, ...form, avatar: form.avatar || avatarFallback });
    } else {
      onAdd({ id: `P${Date.now()}`, ...form, avatar: form.avatar || avatarFallback });
    }
    setShowModal(false);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  return (
    <div className="personnel-page">
      <div className="page-header">
        <div>
          <h2>Personel Yönetimi</h2>
          <p>{personnel.length} personel kayıtlı</p>
        </div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Plus size={16} /> Personel Ekle
        </motion.button>
      </div>

      <div className="personnel-grid">
        {personnel.map((p, i) => (
          <motion.div
            key={p.id}
            className="personnel-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="pc-top">
              <div className="pc-avatar" style={{ background: p.color }}>{p.avatar}</div>
              <div className="pc-info">
                <div className="pc-name">{p.name}</div>
                <div className="pc-role">{p.role}</div>
              </div>
              <div className="pc-actions">
                <button className="icon-btn" onClick={() => openEdit(p)} title="Düzenle"><Pencil size={14} /></button>
                <button className="icon-btn danger" onClick={() => onDelete(p.id)} title="Sil"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="pc-skills">
              {p.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
            <div className="pc-footer">
              <span className="pc-capacity"><User size={11} /> Kapasite: {p.capacity} saat/gün</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editing ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmet Yılmaz" />
                  </div>
                  <div className="form-group">
                    <label>Unvan / Rol</label>
                    <input className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Elektrik Teknisyeni" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Günlük Kapasite (Saat)</label>
                    <select className="form-control" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))}>
                      {[4,6,8,10,12].map(h => <option key={h} value={h}>{h} saat</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Renk</label>
                    <div className="color-picker">
                      {COLORS.map(c => (
                        <button key={c} className={`color-dot ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Yetkinlikler</label>
                  <div className="skill-input-row">
                    <input className="form-control" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Yetkinlik ekle ve Enter'a bas" />
                    <button className="btn btn-secondary" onClick={addSkill}><Plus size={14} /></button>
                  </div>
                  <div className="skills-list">
                    {form.skills.map(s => (
                      <span key={s} className="skill-tag removable">
                        {s}
                        <button onClick={() => removeSkill(s)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim() || !form.role.trim()}>
                    <Check size={14} /> Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
