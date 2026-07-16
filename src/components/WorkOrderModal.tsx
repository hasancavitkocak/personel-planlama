import { useState, useEffect } from 'react';
import type { WorkOrder } from '../types';
import { Dialog, Button, Input, TextArea, Select, Option, Label, FlexBox, MessageStrip } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';

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

  const handleSave = () => {
    if (!formData.id || !formData.title || !formData.requiredSkill) {
      alert('Lütfen zorunlu alanları doldurun (İş Emri No, Başlık, Gerekli Yetkinlik).');
      return;
    }
    onSave({
      ...formData,
      startHour: plannedStart !== '' ? plannedStart as number : null,
    } as WorkOrder);
  };

  return (
    <Dialog
      open={true}
      headerText={workOrder ? 'İş Emrini Düzenle' : 'Yeni İş Emri'}
      onClose={onClose}
      style={{ width: '600px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
        <FlexBox style={{ gap: '12px' }}>
          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label required>İş Emri No</Label>
            <Input
              value={formData.id}
              onInput={(e: any) => setFormData({ ...formData, id: e.target.value })}
            />
          </FlexBox>
          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label required>Öncelik</Label>
            <Select
              onChange={(e: any) => setFormData({ ...formData, priority: e.target.value as any })}
              style={{ width: '100%' }}
            >
              <Option value="low" selected={formData.priority === 'low'}>Düşük</Option>
              <Option value="medium" selected={formData.priority === 'medium'}>Orta</Option>
              <Option value="high" selected={formData.priority === 'high'}>Yüksek</Option>
              <Option value="critical" selected={formData.priority === 'critical'}>Kritik</Option>
            </Select>
          </FlexBox>
        </FlexBox>

        <FlexBox direction="Column" style={{ gap: '4px' }}>
          <Label required>Başlık</Label>
          <Input
            value={formData.title}
            onInput={(e: any) => setFormData({ ...formData, title: e.target.value })}
            style={{ width: '100%' }}
          />
        </FlexBox>

        <FlexBox direction="Column" style={{ gap: '4px' }}>
          <Label>Açıklama</Label>
          <TextArea
            value={formData.description || ''}
            onInput={(e: any) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            style={{ width: '100%' }}
          />
        </FlexBox>

        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>Zaman Planlaması</span>
          
          <FlexBox style={{ gap: '12px' }}>
            <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
              <Label>Süre (Saat)</Label>
              <Select
                onChange={(e: any) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <Option key={h} value={String(h)} selected={formData.duration === h}>{h} saat</Option>
                ))}
              </Select>
            </FlexBox>

            <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
              <Label>Planlanan Başlangıç</Label>
              <Select
                onChange={(e: any) => setPlannedStart(e.target.value === '' ? '' : parseInt(e.target.value))}
                style={{ width: '100%' }}
              >
                <Option value="" selected={plannedStart === ''}>Takvimde belirle</Option>
                {Array.from({ length: 24 }, (_, i) => (
                  <Option key={i} value={String(i)} selected={plannedStart === i}>{String(i).padStart(2, '0')}:00</Option>
                ))}
              </Select>
            </FlexBox>
          </FlexBox>

          {plannedStart !== '' && endHour !== null && (
            <MessageStrip design={endHour > 24 ? "Critical" : "Information"} hideCloseButton>
              {String(plannedStart).padStart(2, '0')}:00 → {String(endHour).padStart(2, '0')}:00 ({formData.duration} saat)
              {endHour > 24 && ' (Günü geçiyor!)'}
            </MessageStrip>
          )}

          {plannedStart === '' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>
              💡 Başlangıç saati seçmezseniz, iş emrini takvimde istediğiniz saate sürükleyerek atayabilirsiniz.
            </span>
          )}
        </div>

        <FlexBox direction="Column" style={{ gap: '4px' }}>
          <Label required>Gerekli Yetkinlik</Label>
          <Input
            value={formData.requiredSkill}
            onInput={(e: any) => setFormData({ ...formData, requiredSkill: e.target.value })}
            style={{ width: '100%' }}
          />
        </FlexBox>

        <FlexBox style={{ gap: '12px' }}>
          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label>Ekipman</Label>
            <Input
              value={formData.equipment}
              onInput={(e: any) => setFormData({ ...formData, equipment: e.target.value })}
            />
          </FlexBox>
          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label>Lokasyon</Label>
            <Input
              value={formData.location}
              onInput={(e: any) => setFormData({ ...formData, location: e.target.value })}
            />
          </FlexBox>
        </FlexBox>
      </div>

      <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', width: '100%' }}>
        <Button design="Transparent" onClick={onClose}>İptal</Button>
        <Button design="Emphasized" onClick={handleSave} disabled={endHour !== null && endHour > 24}>Kaydet</Button>
      </div>
    </Dialog>
  );
}
