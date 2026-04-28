import { useState } from 'react';
import type { User } from '../types';
import { Save, Bell, Palette, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import './WorkOrderModal.css';
import './SettingsPage.css';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

export default function SettingsPage({ user, onUpdateUser }: SettingsPageProps) {
  const [form, setForm] = useState({ name: user.name, role: user.role });
  const [saved, setSaved] = useState(false);
  const [workHourStart, setWorkHourStart] = useState(7);
  const [workHourEnd, setWorkHourEnd] = useState(18);
  const [notifications, setNotifications] = useState({ conflict: true, newOrder: true, daily: false });

  const handleSave = () => {
    onUpdateUser({ ...user, name: form.name, role: form.role, avatar: form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2>Ayarlar</h2>
          <p>Uygulama ve profil ayarları</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <motion.div className="settings-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="settings-card-title"><Shield size={16} /> Profil Bilgileri</div>
          <div className="form-group">
            <label>Ad Soyad</label>
            <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Unvan</label>
            <input className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <motion.button className="btn btn-primary save-btn" onClick={handleSave} whileTap={{ scale: 0.97 }}>
            <Save size={14} />
            {saved ? 'Kaydedildi ✓' : 'Kaydet'}
          </motion.button>
        </motion.div>

        {/* Work hours */}
        <motion.div className="settings-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="settings-card-title"><Globe size={16} /> Çalışma Saatleri</div>
          <div className="form-row">
            <div className="form-group">
              <label>Başlangıç Saati</label>
              <select className="form-control" value={workHourStart} onChange={e => setWorkHourStart(+e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 5).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bitiş Saati</label>
              <select className="form-control" value={workHourEnd} onChange={e => setWorkHourEnd(+e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 14).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings-info">
            Takvimde <strong>{String(workHourStart).padStart(2,'0')}:00 – {String(workHourEnd).padStart(2,'0')}:00</strong> arası gösterilecek.
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div className="settings-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="settings-card-title"><Bell size={16} /> Bildirimler</div>
          {[
            { key: 'conflict', label: 'Çakışma uyarıları', desc: 'Atama çakışmalarında uyar' },
            { key: 'newOrder', label: 'Yeni iş emri', desc: 'Yeni iş emri eklendiğinde bildir' },
            { key: 'daily', label: 'Günlük özet', desc: 'Her sabah günlük plan özeti' },
          ].map(item => (
            <div key={item.key} className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label">{item.label}</div>
                <div className="toggle-desc">{item.desc}</div>
              </div>
              <button
                className={`toggle-btn ${notifications[item.key as keyof typeof notifications] ? 'on' : ''}`}
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof notifications] }))}
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Appearance */}
        <motion.div className="settings-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="settings-card-title"><Palette size={16} /> Görünüm</div>
          <div className="settings-info" style={{ marginTop: 0 }}>
            Tema ve görünüm özelleştirme yakında eklenecek.
          </div>
          <div className="theme-preview">
            <div className="theme-swatch active">
              <div className="swatch-bar" style={{ background: 'linear-gradient(135deg, #0F2460, #1D4ED8)' }} />
              <span>Varsayılan</span>
            </div>
            <div className="theme-swatch">
              <div className="swatch-bar" style={{ background: 'linear-gradient(135deg, #064E3B, #059669)' }} />
              <span>Yeşil</span>
            </div>
            <div className="theme-swatch">
              <div className="swatch-bar" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }} />
              <span>Mor</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
