import { useState } from 'react';
import type { Personnel } from '../types';
import { Button, Card, Tag, Icon, FlexBox, Avatar, Dialog, Input, Select, Option, Label } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import { motion } from 'framer-motion';
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
    <div className="personnel-page" style={{ backgroundColor: 'var(--sapBackgroundColor)', padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--sapTextColor)', margin: 0 }}>Personel Yönetimi</h2>
          <p style={{ color: 'var(--sapContent_LabelColor)', margin: '4px 0 0 0' }}>{personnel.length} personel kayıtlı</p>
        </div>
        <Button design="Emphasized" icon="add" onClick={openAdd}>Personel Ekle</Button>
      </div>

      <div className="personnel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {personnel.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card style={{ width: '100%' }}>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <FlexBox justifyContent="SpaceBetween" alignItems="Start">
                  <FlexBox alignItems="Center" style={{ gap: '12px' }}>
                    <Avatar initials={p.avatar} colorScheme="Accent6" style={{ backgroundColor: p.color, width: '45px', height: '45px' }} />
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--sapTextColor)', fontSize: '0.95rem' }}>{p.name}</h4>
                      <p style={{ margin: '2px 0 0 0', color: 'var(--sapContent_LabelColor)', fontSize: '0.8rem' }}>{p.role}</p>
                    </div>
                  </FlexBox>
                  <FlexBox style={{ gap: '4px' }}>
                    <Button design="Transparent" icon="edit" style={{ width: '28px', height: '28px' }} onClick={() => openEdit(p)} />
                    <Button design="Transparent" icon="delete" style={{ width: '28px', height: '28px' }} onClick={() => onDelete(p.id)} />
                  </FlexBox>
                </FlexBox>

                <FlexBox wrap="Wrap" style={{ gap: '6px', minHeight: '30px' }}>
                  {p.skills.map(s => (
                    <Tag key={s} colorScheme="6">{s}</Tag>
                  ))}
                </FlexBox>

                <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '8px', fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="employee" style={{ width: '14px', height: '14px' }} />
                  <span>Günlük Kapasite: <strong>{p.capacity} saat</strong></span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <Dialog
          open={true}
          headerText={editing ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
          onClose={() => setShowModal(false)}
          style={{ width: '400px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
            <FlexBox style={{ gap: '12px' }}>
              <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                <Label required>Ad Soyad</Label>
                <Input
                  value={form.name}
                  placeholder="Ahmet Yılmaz"
                  onInput={(e: any) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </FlexBox>
              <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                <Label required>Unvan / Rol</Label>
                <Input
                  value={form.role}
                  placeholder="Elektrik Teknisyeni"
                  onInput={(e: any) => setForm(f => ({ ...f, role: e.target.value }))}
                />
              </FlexBox>
            </FlexBox>

            <FlexBox style={{ gap: '12px' }}>
              <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                <Label>Kapasite (Saat)</Label>
                <Select
                  onChange={(e: any) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                >
                  {[4, 6, 8, 10, 12].map(h => (
                    <Option key={h} value={String(h)} selected={form.capacity === h}>{h} saat</Option>
                  ))}
                </Select>
              </FlexBox>
              <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
                <Label>Renk Etiketi</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        boxShadow: form.color === c ? '0 0 0 2px var(--sapContent_SelectedColor)' : 'none',
                        border: '1px solid white'
                      }}
                    />
                  ))}
                </div>
              </FlexBox>
            </FlexBox>

            <FlexBox direction="Column" style={{ gap: '4px' }}>
              <Label>Yetkinlikler</Label>
              <FlexBox style={{ gap: '8px', width: '100%' }}>
                <Input
                  value={skillInput}
                  placeholder="Yetkinlik ekle"
                  style={{ flex: 1 }}
                  onInput={(e: any) => setSkillInput(e.target.value)}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button icon="add" onClick={addSkill} />
              </FlexBox>
              <FlexBox wrap="Wrap" style={{ gap: '6px', marginTop: '8px' }}>
                {form.skills.map(s => (
                  <Tag
                    key={s}
                    colorScheme="6"
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeSkill(s)}
                  >
                    {s} ✕
                  </Tag>
                ))}
              </FlexBox>
            </FlexBox>
          </div>

          <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', width: '100%' }}>
            <Button design="Transparent" onClick={() => setShowModal(false)}>İptal</Button>
            <Button design="Emphasized" icon="accept" onClick={handleSave} disabled={!form.name.trim() || !form.role.trim()}>Kaydet</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
