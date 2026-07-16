import { useState } from 'react';
import type { Assignment } from '../types';
import { Dialog, Button, Select, Option, Label, FlexBox, MessageStrip, Tag } from '@ui5/webcomponents-react';

interface AssignmentEditModalProps {
  assignment: Assignment;
  onSave: (startHour: number, duration: number) => void;
  onClose: () => void;
}

const priorityScheme: Record<string, string> = {
  critical: '1',
  high:     '2',
  medium:   '6',
  low:      '3',
};

const priorityLabels: Record<string, string> = {
  critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük',
};

export default function AssignmentEditModal({ assignment, onSave, onClose }: AssignmentEditModalProps) {
  const [startHour, setStartHour] = useState(assignment.startHour);
  const [duration, setDuration] = useState(assignment.duration);

  const endHour = startHour + duration;

  const handleSave = () => {
    if (endHour > 24) {
      alert('Bitiş saati 24:00\'ü geçemez.');
      return;
    }
    onSave(startHour, duration);
  };

  return (
    <Dialog
      open={true}
      headerText="Atamayı Düzenle"
      onClose={onClose}
      style={{ width: '400px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
        <FlexBox justifyContent="SpaceBetween" alignItems="Center">
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>{assignment.title}</span>
          <Tag colorScheme={priorityScheme[assignment.priority]}>
            {priorityLabels[assignment.priority]}
          </Tag>
        </FlexBox>
        <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', marginTop: '-8px' }}>
          {assignment.workOrderId} · {assignment.equipment}
        </span>

        <MessageStrip design={endHour > 24 ? "Critical" : "Information"} hideCloseButton>
          Planlanan Zaman: {String(startHour).padStart(2,'0')}:00 → {String(endHour).padStart(2,'0')}:00 ({duration} saat)
          {endHour > 24 && ' (Günü geçiyor!)'}
        </MessageStrip>

        <FlexBox style={{ gap: '12px' }}>
          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label>Başlangıç Saati</Label>
            <Select
              onChange={(e: any) => setStartHour(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Option key={i} value={String(i)} selected={startHour === i}>{String(i).padStart(2,'0')}:00</Option>
              ))}
            </Select>
          </FlexBox>

          <FlexBox direction="Column" style={{ flex: 1, gap: '4px' }}>
            <Label>Süre (Saat)</Label>
            <Select
              onChange={(e: any) => setDuration(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <Option key={h} value={String(h)} selected={duration === h}>{h} saat</Option>
              ))}
            </Select>
          </FlexBox>
        </FlexBox>
      </div>

      <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', width: '100%' }}>
        <Button design="Transparent" onClick={onClose}>İptal</Button>
        <Button design="Emphasized" onClick={handleSave} disabled={endHour > 24}>Kaydet</Button>
      </div>
    </Dialog>
  );
}
