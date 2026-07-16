import { useState } from 'react';
import type { User } from '../types';
import { Button, Card, FlexBox, Input, Label, Select, Option, Switch } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/save.js';
import '@ui5/webcomponents-icons/dist/settings.js';
import '@ui5/webcomponents-icons/dist/bell.js';
import '@ui5/webcomponents-icons/dist/palette.js';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import { motion } from 'framer-motion';
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
    <div className="settings-page" style={{ backgroundColor: 'var(--sapBackgroundColor)', padding: '20px 24px', flex: 1, overflowY: 'auto' }}>


      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Profil Bilgileri</h3>
              <FlexBox direction="Column" style={{ gap: '4px' }}>
                <Label>Ad Soyad</Label>
                <Input value={form.name} onInput={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
              </FlexBox>
              <FlexBox direction="Column" style={{ gap: '4px' }}>
                <Label>Unvan</Label>
                <Input value={form.role} onInput={(e: any) => setForm(f => ({ ...f, role: e.target.value }))} style={{ width: '100%' }} />
              </FlexBox>
              <Button design="Emphasized" icon="save" onClick={handleSave} style={{ width: '120px', marginTop: '8px' }}>
                {saved ? 'Kaydedildi ✓' : 'Kaydet'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Work hours */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Çalışma Saatleri</h3>
              <FlexBox style={{ gap: '12px' }}>
                <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                  <Label>Başlangıç Saati</Label>
                  <Select onChange={(e: any) => setWorkHourStart(Number(e.target.value))} style={{ width: '100%' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 5).map(h => (
                      <Option key={h} value={String(h)} selected={workHourStart === h}>{String(h).padStart(2,'0')}:00</Option>
                    ))}
                  </Select>
                </FlexBox>
                <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                  <Label>Bitiş Saati</Label>
                  <Select onChange={(e: any) => setWorkHourEnd(Number(e.target.value))} style={{ width: '100%' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 14).map(h => (
                      <Option key={h} value={String(h)} selected={workHourEnd === h}>{String(h).padStart(2,'0')}:00</Option>
                    ))}
                  </Select>
                </FlexBox>
              </FlexBox>
              <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                Takvimde <strong>{String(workHourStart).padStart(2,'0')}:00 – {String(workHourEnd).padStart(2,'0')}:00</strong> arası gösterilecek.
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Bildirimler</h3>
              {[
                { key: 'conflict', label: 'Çakışma uyarıları', desc: 'Atama çakışmalarında uyar' },
                { key: 'newOrder', label: 'Yeni iş emri', desc: 'Yeni iş emri eklendiğinde bildir' },
                { key: 'daily', label: 'Günlük özet', desc: 'Her sabah günlük plan özeti' },
              ].map(item => (
                <FlexBox key={item.key} justifyContent="SpaceBetween" alignItems="Center" style={{ borderBottom: '1px solid var(--sapList_BorderColor)', paddingBottom: '12px' }}>
                  <div>
                    <Label style={{ fontWeight: 'bold', display: 'block' }}>{item.label}</Label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>{item.desc}</span>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e: any) => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                  />
                </FlexBox>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card style={{ width: '100%' }}>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--sapTextColor)' }}>Görünüm</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                Tema ve görünüm özelleştirme yakında eklenecek.
              </span>
              <div className="theme-preview" style={{ display: 'flex', gap: '10px' }}>
                <div className="theme-swatch active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div className="swatch-bar" style={{ width: '60px', height: '35px', borderRadius: '4px', background: 'linear-gradient(135deg, #0F2460, #1D4ED8)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--sapTextColor)' }}>Varsayılan</span>
                </div>
                <div className="theme-swatch" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div className="swatch-bar" style={{ width: '60px', height: '35px', borderRadius: '4px', background: 'linear-gradient(135deg, #064E3B, #059669)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--sapTextColor)' }}>Yeşil</span>
                </div>
                <div className="theme-swatch" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div className="swatch-bar" style={{ width: '60px', height: '35px', borderRadius: '4px', background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--sapTextColor)' }}>Mor</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
