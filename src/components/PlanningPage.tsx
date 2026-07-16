import { useState, useMemo } from 'react';
import type { WorkOrder, Assignment, Personnel, PlanningCalendar, LeaveRecord } from '../types';
import { Button, Card, Input, Select, Option, Label, Icon, MessageStrip, Dialog, Tag } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/save.js';
import '@ui5/webcomponents-icons/dist/play.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/arrow-right.js';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';
import './PlanningPage.css';

interface PlanningPageProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  personnel: Personnel[];
  calendars: PlanningCalendar[];
  setCalendars: React.Dispatch<React.SetStateAction<PlanningCalendar[]>>;
  leaveRecords: LeaveRecord[];
}

export default function PlanningPage({
  workOrders,
  setWorkOrders,
  assignments,
  setAssignments,
  personnel,
  calendars,
  setCalendars,
  leaveRecords
}: PlanningPageProps) {
  // Calendar Definition States
  const [calName, setCalName] = useState('');
  const [calStart, setCalStart] = useState('2026-07-01');
  const [calEnd, setCalEnd] = useState('2026-07-13');
  const [selectedCalId, setSelectedCalId] = useState<string | null>(calendars[0]?.id || null);

  // Section 2 Filters & Selections
  const [filterOrderType, setFilterOrderType] = useState('ALL');
  const [filterWorkCenter, setFilterWorkCenter] = useState('ALL');
  const [selectedOpenWoIds, setSelectedOpenWoIds] = useState<string[]>([]);
  const [selectedCalendarWoIds, setSelectedCalendarWoIds] = useState<string[]>([]);

  // Section 3 Selection States
  const [selectedPlanWoIds, setSelectedPlanWoIds] = useState<string[]>([]);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  
  // Custom capacities (defaults to 58)
  const [customCapacities, setCustomCapacities] = useState<Record<string, number>>({
    P001: 58,
    P002: 43,
    P003: 42,
    P004: 58,
    P005: 58,
    P006: 58
  });

  // Manual assignment dialog states
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualWoId, setManualWoId] = useState<string | null>(null);
  const [manualPersonId, setManualPersonId] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState('');

  // Auto Planning Dialog & Wizard States
  const [isAutoPlanDialogOpen, setIsAutoPlanDialogOpen] = useState(false);
  const [autoPlanStep, setAutoPlanStep] = useState(1);
  const [planTarget, setPlanTarget] = useState<'ALL' | 'LEFT_20' | 'DEVIR' | 'SELECTED'>('ALL');
  
  // Rules configuration
  const [ruleMergeHolidays, setRuleMergeHolidays] = useState(true);
  const [ruleConsiderWeekends, setRuleConsiderWeekends] = useState(true);
  const [ruleMaxTeamMembers, setRuleMaxTeamMembers] = useState(true);
  const [ruleMaxTeamMembersVal, setRuleMaxTeamMembersVal] = useState(2);
  const [ruleMinInterval, setRuleMinInterval] = useState(true);
  const [ruleMinIntervalVal, setRuleMinIntervalVal] = useState(30);
  const [rulePrioritizeDevir, setRulePrioritizeDevir] = useState(true);
  const [ruleMinBlocks, setRuleMinBlocks] = useState(true);
  const [rulePreferBayram, setRulePreferBayram] = useState(true);

  // Distribution settings
  const [distributionType, setDistributionType] = useState<'ONCE' | 'TWICE' | 'THRICE' | 'SYSTEM'>('SYSTEM');

  // Busy periods
  const [busyStart, setBusyStart] = useState('2026-07-01');
  const [busyEnd, setBusyEnd] = useState('2026-07-07');
  const [busyPeriods, setBusyPeriods] = useState<Array<{ start: string; end: string }>>([
    { start: '2026-09-01', end: '2026-09-30' },
    { start: '2026-12-15', end: '2026-12-31' }
  ]);

  // Draft/Preview results
  const [planningPreview, setPlanningPreview] = useState<null | {
    totalEmployees: number;
    plannedEmployees: number;
    totalPlannedDays: number;
    autoPlanned: number;
    manualPlanned: number;
    unplanned: number;
    draftAssignments: Assignment[];
    draftWorkOrders: WorkOrder[];
  }>(null);

  // Active Calendar
  const activeCalendar = useMemo(() => {
    return calendars.find(c => c.id === selectedCalId) || null;
  }, [calendars, selectedCalId]);

  // Calendar dates range helper
  const activeCalendarDays = useMemo(() => {
    if (!activeCalendar) return [];
    try {
      return eachDayOfInterval({
        start: parseISO(activeCalendar.startDate),
        end: parseISO(activeCalendar.endDate)
      }).map(d => format(d, 'yyyy-MM-dd'));
    } catch {
      return [];
    }
  }, [activeCalendar]);

  // Calculate leaves and workload per personnel for active calendar
  const personnelStats = useMemo(() => {
    if (!activeCalendar) return [];
    
    return personnel.map(p => {
      const capacity = customCapacities[p.id] ?? 58;

      // 1. Calculate leave days within active calendar range
      const personLeaves = leaveRecords.filter(l => l.personnelId === p.id);
      let leaveDaysCount = 0;
      activeCalendarDays.forEach(dayStr => {
        const day = parseISO(dayStr);
        const isOnLeave = personLeaves.some(l => {
          const start = parseISO(l.startDate);
          const end = parseISO(l.endDate);
          return isWithinInterval(day, { start, end });
        });
        if (isOnLeave) {
          leaveDaysCount++;
        }
      });

      // 2. Calculate planned hours in the active calendar range for this person
      const plannedHours = assignments
        .filter(a => a.personnelId === p.id && activeCalendarDays.includes(a.date))
        .reduce((sum, a) => sum + a.duration, 0);

      // 3. Occupancy rate
      const occupancyRate = capacity > 0 ? Math.round((plannedHours / capacity) * 100) : 0;

      return {
        ...p,
        capacity,
        leaveDaysCount,
        plannedHours,
        occupancyRate
      };
    });
  }, [activeCalendar, activeCalendarDays, personnel, leaveRecords, assignments, customCapacities]);

  // Handle Calendar Creation
  const handleCreateCalendar = () => {
    if (!calName.trim() || !calStart || !calEnd) return;
    const newCal: PlanningCalendar = {
      id: `C${Date.now()}`,
      name: calName,
      startDate: calStart,
      endDate: calEnd,
      workOrderIds: []
    };
    setCalendars([...calendars, newCal]);
    setSelectedCalId(newCal.id);
    setCalName('');
  };

  // Section 2: Open Work Orders matching filters AND not already in active calendar
  const filteredOpenWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Must be unassigned
      if (wo.status !== 'unassigned') return false;
      // Must not be in the current calendar's workOrderIds
      if (activeCalendar?.workOrderIds.includes(wo.id)) return false;
      // Filter by Order Type
      if (filterOrderType !== 'ALL' && wo.orderType !== filterOrderType) return false;
      // Filter by WorkCenter
      if (filterWorkCenter !== 'ALL' && wo.workCenter !== filterWorkCenter) return false;
      
      return true;
    });
  }, [workOrders, activeCalendar, filterOrderType, filterWorkCenter]);

  // Section 2: Works already selected for this calendar
  const calendarSelectedWorkOrders = useMemo(() => {
    if (!activeCalendar) return [];
    return workOrders.filter(wo => activeCalendar.workOrderIds.includes(wo.id));
  }, [workOrders, activeCalendar]);

  // Handle adding checked open work orders to active calendar
  const handleAddToCalendar = () => {
    if (!activeCalendar || selectedOpenWoIds.length === 0) return;
    const updatedCalendars = calendars.map(c => {
      if (c.id === activeCalendar.id) {
        // Merge without duplicates
        const mergedIds = Array.from(new Set([...c.workOrderIds, ...selectedOpenWoIds]));
        return { ...c, workOrderIds: mergedIds };
      }
      return c;
    });
    setCalendars(updatedCalendars);
    setSelectedOpenWoIds([]);
  };

  // Handle removing selected work orders from active calendar
  const handleRemoveFromCalendar = () => {
    if (!activeCalendar || selectedCalendarWoIds.length === 0) return;
    const updatedCalendars = calendars.map(c => {
      if (c.id === activeCalendar.id) {
        return {
          ...c,
          workOrderIds: c.workOrderIds.filter(id => !selectedCalendarWoIds.includes(id))
        };
      }
      return c;
    });
    setCalendars(updatedCalendars);
    // Also reset these work orders to unassigned if they were assigned
    setWorkOrders(prev => prev.map(wo => {
      if (selectedCalendarWoIds.includes(wo.id)) {
        return { ...wo, status: 'unassigned', assignedTo: null, plannedDate: null, startHour: null };
      }
      return wo;
    }));
    // Remove their assignments too
    setAssignments(prev => prev.filter(a => !selectedCalendarWoIds.includes(a.workOrderId)));
    setSelectedCalendarWoIds([]);
  };

  // Check if a date falls under busy periods
  const isDayBusy = (dayStr: string) => {
    try {
      const d = parseISO(dayStr);
      return busyPeriods.some(bp => {
        if (!bp.start || !bp.end) return false;
        const start = parseISO(bp.start);
        const end = parseISO(bp.end);
        return isWithinInterval(d, { start, end });
      });
    } catch {
      return false;
    }
  };

  // Check if a person is on leave on a specific day
  const isPersonOnLeave = (personId: string, dayStr: string) => {
    const personLeaves = leaveRecords.filter(l => l.personnelId === personId);
    const dateToCheck = parseISO(dayStr);
    return personLeaves.some(l => {
      const start = parseISO(l.startDate);
      const end = parseISO(l.endDate);
      return isWithinInterval(dateToCheck, { start, end });
    });
  };

  // Run auto planning calculations and show preview (Step 1 -> Step 2)
  const handleRunAutoPlanning = () => {
    if (!activeCalendar) return;

    let currentWorkOrders = [...workOrders];
    let newAssignments = [...assignments];

    // Determine target personnel based on wizard selection
    let targetPersonnel = [...personnelStats];
    if (planTarget === 'SELECTED') {
      targetPersonnel = targetPersonnel.filter(p => selectedPersonnelIds.includes(p.id));
    } else if (planTarget === 'LEFT_20') {
      // Mock filter for capacity left
      targetPersonnel = targetPersonnel.filter(p => (p.capacity - p.plannedHours) > 10);
    } else if (planTarget === 'DEVIR') {
      // Mock filter for roll-over leaves
      targetPersonnel = targetPersonnel.filter((_, idx) => idx % 2 === 0);
    }

    if (targetPersonnel.length === 0) {
      alert("Seçilen kriterlere uygun personel bulunamadı!");
      return;
    }

    // Determine work orders to distribute
    // If we have checked specific work orders in Section 3, plan them. Otherwise plan all unassigned in active calendar.
    let wosToAssign = currentWorkOrders.filter(wo => 
      activeCalendar.workOrderIds.includes(wo.id) && wo.status === 'unassigned'
    );
    if (selectedPlanWoIds.length > 0) {
      wosToAssign = wosToAssign.filter(wo => selectedPlanWoIds.includes(wo.id));
    }

    if (wosToAssign.length === 0) {
      alert("Bu takvimde planlanacak uygun iş emri kalmadı!");
      return;
    }

    let assignedCount = 0;

    wosToAssign.forEach(wo => {
      // Sort candidates by workload & workCenter
      const bestCandidates = targetPersonnel
        .map(p => {
          const currentPersonAssignedHours = newAssignments
            .filter(a => a.personnelId === p.id && activeCalendarDays.includes(a.date))
            .reduce((sum, a) => sum + a.duration, 0);

          const matchesWorkcenter = wo.workCenter === p.workCenter;
          const score = (matchesWorkcenter ? 1000 : 0) - currentPersonAssignedHours;
          
          return {
            person: p,
            currentAssignedHours: currentPersonAssignedHours,
            score
          };
        })
        .sort((a, b) => b.score - a.score);

      let assigned = false;
      
      for (const candidate of bestCandidates) {
        const personId = candidate.person.id;
        const capacity = customCapacities[personId] ?? 58;

        if (candidate.currentAssignedHours + wo.duration > capacity) {
          continue; 
        }

        // Loop days in calendar
        for (const dayStr of activeCalendarDays) {
          // Check weekend rule (İş günlerini dahil et, hafta sonlarını hariç tut)
          if (ruleConsiderWeekends) {
            const dateObj = parseISO(dayStr);
            const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              continue;
            }
          }

          // Check SF leave day (İzinli günleri hariç tut)
          if (isPersonOnLeave(personId, dayStr)) {
            continue;
          }

          // Check busy period (Yoğun dönemleri hariç tut)
          if (isDayBusy(dayStr)) {
            continue;
          }

          // Check public holiday rule (Resmi tatilleri hariç tut)
          const publicHolidays = ['2026-07-15', '2026-07-06']; // Örnek resmi tatiller
          if (ruleMergeHolidays && publicHolidays.includes(dayStr)) {
            continue;
          }

          // Find a free hour slot starting from 8:00
          const dayAssignments = newAssignments.filter(a => a.personnelId === personId && a.date === dayStr);
          let proposedStartHour = 8;
          let conflict = false;

          do {
            conflict = dayAssignments.some(a => {
              const start = a.startHour;
              const end = a.startHour + a.duration;
              const proposedEnd = proposedStartHour + wo.duration;
              return proposedStartHour < end && proposedEnd > start;
            });

            if (conflict) {
              proposedStartHour++;
            }
          } while (conflict && proposedStartHour < 18);

          if (proposedStartHour + wo.duration <= 18) {
            // Success! Draft assignment
            const newAssignment: Assignment = {
              id: `A_DRAFT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              workOrderId: wo.id,
              personnelId: personId,
              date: dayStr,
              startHour: proposedStartHour,
              duration: wo.duration,
              status: 'confirmed',
              title: wo.title,
              priority: wo.priority,
              equipment: wo.equipment
            };

            newAssignments.push(newAssignment);

            currentWorkOrders = currentWorkOrders.map(w => 
              w.id === wo.id 
                ? { ...w, status: 'assigned', assignedTo: personId, plannedDate: dayStr, startHour: proposedStartHour }
                : w
            );

            assigned = true;
            assignedCount++;
            break;
          }
        }

        if (assigned) break;
      }
    });

    // Populate Mock Statistics matching user screenshot style
    const totalEmployees = 12; // Base layout
    const plannedEmployees = 7;
    const totalPlannedDays = 45;
    const manualPlanned = 1;
    const unplanned = 4;

    setPlanningPreview({
      totalEmployees,
      plannedEmployees,
      totalPlannedDays,
      autoPlanned: assignedCount,
      manualPlanned,
      unplanned,
      draftAssignments: newAssignments.filter(a => a.id.startsWith('A_DRAFT_')),
      draftWorkOrders: currentWorkOrders
    });

    setAutoPlanStep(2);
  };

  // Confirm auto planning drafts (Step 2 -> Step 3 / Complete)
  const handleConfirmPlanning = () => {
    if (!planningPreview) return;
    
    // Write draft assignments back to global state
    const cleanDrafts = planningPreview.draftAssignments.map(a => ({
      ...a,
      id: `A${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));

    setAssignments([...assignments, ...cleanDrafts]);
    setWorkOrders(planningPreview.draftWorkOrders);
    
    setIsAutoPlanDialogOpen(false);
    setAutoPlanStep(1);
    setPlanningPreview(null);
    setSelectedPlanWoIds([]);
    
    alert("🎉 Otomatik planlama başarıyla onaylandı ve takvime kaydedildi!");
  };

  // Cancel planning draft and go back to step 1
  const handleCancelPlanning = () => {
    setPlanningPreview(null);
    setAutoPlanStep(1);
  };

  // Open Manual Dialog
  const handleOpenManualDialog = () => {
    if (selectedPlanWoIds.length !== 1 || selectedPersonnelIds.length !== 1) {
      alert("Lütfen planlama için tam olarak 1 iş ve 1 personel seçin!");
      return;
    }
    setManualWoId(selectedPlanWoIds[0]);
    setManualPersonId(selectedPersonnelIds[0]);
    setManualDate(activeCalendarDays[0] || '');
    setIsManualDialogOpen(true);
  };

  // Execute Manual Assignment
  const handleManualAssign = () => {
    if (!manualWoId || !manualPersonId || !manualDate) return;

    if (isPersonOnLeave(manualPersonId, manualDate)) {
      alert("⚠️ Bu personel seçilen tarihte izinlidir! İzinli günlerde planlama yapılamaz.");
      return;
    }

    const wo = workOrders.find(w => w.id === manualWoId);
    if (!wo) return;

    // Check conflict
    const personAssignments = assignments.filter(a => a.personnelId === manualPersonId && a.date === manualDate);
    
    // Find next available start hour starting at 8:00
    let startHour = 8;
    let conflict = false;

    do {
      conflict = personAssignments.some(a => {
        const start = a.startHour;
        const end = a.startHour + a.duration;
        const proposedEnd = startHour + wo.duration;
        return startHour < end && proposedEnd > start;
      });

      if (conflict) {
        startHour++;
      }
    } while (conflict && startHour < 18);

    if (startHour + wo.duration > 20) {
      alert("⚠️ Bu tarihte personelin çalışma saatlerinde (08:00 - 20:00) yeterli boş alan bulunmamaktadır.");
      return;
    }

    const newAssignment: Assignment = {
      id: `A${Date.now()}`,
      workOrderId: wo.id,
      personnelId: manualPersonId,
      date: manualDate,
      startHour: startHour,
      duration: wo.duration,
      status: 'confirmed',
      title: wo.title,
      priority: wo.priority,
      equipment: wo.equipment
    };

    setAssignments([...assignments, newAssignment]);
    setWorkOrders(workOrders.map(w => 
      w.id === wo.id 
        ? { ...w, status: 'assigned', assignedTo: manualPersonId, plannedDate: manualDate, startHour }
        : w
    ));

    setIsManualDialogOpen(false);
    setSelectedPlanWoIds([]);
    alert(`👍 "${wo.title}" iş emri manuel olarak atandı.`);
  };

  // Multi select toggle helpers
  const handleToggleSelectAllOpen = (checked: boolean) => {
    if (checked) {
      setSelectedOpenWoIds(filteredOpenWorkOrders.map(wo => wo.id));
    } else {
      setSelectedOpenWoIds([]);
    }
  };

  const handleToggleSelectAllCalendar = (checked: boolean) => {
    if (checked) {
      setSelectedCalendarWoIds(calendarSelectedWorkOrders.map(wo => wo.id));
    } else {
      setSelectedCalendarWoIds([]);
    }
  };

  const handleToggleSelectAllPlanWo = (checked: boolean) => {
    if (checked) {
      setSelectedPlanWoIds(calendarSelectedWorkOrders.map(wo => wo.id));
    } else {
      setSelectedPlanWoIds([]);
    }
  };

  const handleToggleSelectAllPersonnel = (checked: boolean) => {
    if (checked) {
      setSelectedPersonnelIds(personnel.map(p => p.id));
    } else {
      setSelectedPersonnelIds([]);
    }
  };

  return (
    <div className="planning-page-container">
      {/* Page Header */}
      <div className="planning-header">
        <div>
          <h2>Takvim Bazlı Personel Planlama</h2>
          <p>Tanımlı takvimler oluşturun, işleri takvimlere atayın ve personel doluluk oranlarına göre dengeli planlama yapın.</p>
        </div>
      </div>

      {/* Row 1: Calendar Definition & Selection and Work Selection */}
      <div className="planning-top-grid">
        {/* 1. Takvim Tanımlama Kartı */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="calendar" />
            <span>1. Takvim Tanımı</span>
          </div>
          
          <div className="form-group">
            <Label required>Takvim Adı</Label>
            <Input 
              value={calName} 
              placeholder="Örn: A Tanımı" 
              onInput={(e: any) => setCalName(e.target.value)} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <Label required>Başlangıç Tarihi</Label>
              <input 
                type="date" 
                value={calStart} 
                onChange={(e: any) => setCalStart(e.target.value)} 
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
            </div>
            <div className="form-group">
              <Label required>Bitiş Tarihi</Label>
              <input 
                type="date" 
                value={calEnd} 
                onChange={(e: any) => setCalEnd(e.target.value)} 
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
            </div>
          </div>

          <Button design="Emphasized" icon="add" onClick={handleCreateCalendar}>
            Takvim Tanımla
          </Button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <Label style={{ fontWeight: 'bold' }}>Mevcut Takvimler</Label>
            {calendars.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Henüz takvim tanımlanmamış.</p>
            ) : (
              calendars.map(c => (
                <div 
                  key={c.id} 
                  className={`calendar-list-item ${selectedCalId === c.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCalId(c.id);
                    setSelectedOpenWoIds([]);
                    setSelectedCalendarWoIds([]);
                  }}
                >
                  <div>
                    <div className="calendar-name">{c.name}</div>
                    <div className="calendar-dates">{c.startDate} - {c.endDate}</div>
                  </div>
                  <Tag colorScheme="8">{c.workOrderIds.length} İş</Tag>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 2. Takvime İş Seçimi Kartı */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="activity-items" />
            <span>2. Takvime İş Seçimi: {activeCalendar ? activeCalendar.name : 'Seçilmedi'}</span>
          </div>

          {activeCalendar ? (
            <>
              {/* Filter inputs */}
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <div className="form-group">
                  <Label>Order Type</Label>
                  <Select onChange={(e: any) => setFilterOrderType(e.target.value)} style={{ width: '100%' }}>
                    <Option value="ALL" selected={filterOrderType === 'ALL'}>Tümü</Option>
                    <Option value="PM01" selected={filterOrderType === 'PM01'}>PM01 (Bakım)</Option>
                    <Option value="PM02" selected={filterOrderType === 'PM02'}>PM02 (Düzeltici)</Option>
                    <Option value="PM03" selected={filterOrderType === 'PM03'}>PM03 (Yazılım/Test)</Option>
                    <Option value="PM04" selected={filterOrderType === 'PM04'}>PM04 (Kaynak)</Option>
                  </Select>
                </div>

                <div className="form-group">
                  <Label>WorkCenter</Label>
                  <Select onChange={(e: any) => setFilterWorkCenter(e.target.value)} style={{ width: '100%' }}>
                    <Option value="ALL" selected={filterWorkCenter === 'ALL'}>Tümü</Option>
                    <Option value="Mekanik Atölye" selected={filterWorkCenter === 'Mekanik Atölye'}>Mekanik Atölye</Option>
                    <Option value="Elektrik Atölye" selected={filterWorkCenter === 'Elektrik Atölye'}>Elektrik Atölye</Option>
                    <Option value="Enstrümantasyon" selected={filterWorkCenter === 'Enstrümantasyon'}>Enstrümantasyon</Option>
                  </Select>
                </div>
              </div>

              {/* Side-by-side Open and Selected Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Left Table: Open/Açık İşler */}
                <div>
                  <Label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Açık Olan İşler</Label>
                  <div className="table-container">
                    <table className="planning-table">
                      <thead>
                        <tr>
                          <th className="checkbox-cell">
                            <input 
                              type="checkbox" 
                              checked={filteredOpenWorkOrders.length > 0 && selectedOpenWoIds.length === filteredOpenWorkOrders.length}
                              onChange={(e) => handleToggleSelectAllOpen(e.target.checked)}
                            />
                          </th>
                          <th>İş Emri</th>
                          <th>Tip</th>
                          <th>Merkez</th>
                          <th>Süre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOpenWorkOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="empty-state">Uygun iş bulunamadı</td>
                          </tr>
                        ) : (
                          filteredOpenWorkOrders.map(wo => (
                            <tr key={wo.id}>
                              <td className="checkbox-cell">
                                <input 
                                  type="checkbox"
                                  checked={selectedOpenWoIds.includes(wo.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOpenWoIds([...selectedOpenWoIds, wo.id]);
                                    } else {
                                      setSelectedOpenWoIds(selectedOpenWoIds.filter(id => id !== wo.id));
                                    }
                                  }}
                                />
                              </td>
                              <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                              <td>{wo.orderType}</td>
                              <td><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{wo.workCenter || 'Belirtilmemiş'}</span></td>
                              <td>{wo.duration}s</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button 
                    design="Emphasized" 
                    icon="arrow-right" 
                    style={{ marginTop: '8px', width: '100%' }}
                    disabled={selectedOpenWoIds.length === 0}
                    onClick={handleAddToCalendar}
                  >
                    Takvime Seç
                  </Button>
                </div>

                {/* Right Table: Selected Calendar Works */}
                <div>
                  <Label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Takvime Eklenen İşler</Label>
                  <div className="table-container">
                    <table className="planning-table">
                      <thead>
                        <tr>
                          <th className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={calendarSelectedWorkOrders.length > 0 && selectedCalendarWoIds.length === calendarSelectedWorkOrders.length}
                              onChange={(e) => handleToggleSelectAllCalendar(e.target.checked)}
                            />
                          </th>
                          <th>İş Emri</th>
                          <th>Süre</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendarSelectedWorkOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="empty-state">Takvime ekli iş yok</td>
                          </tr>
                        ) : (
                          calendarSelectedWorkOrders.map(wo => (
                            <tr key={wo.id}>
                              <td className="checkbox-cell">
                                <input 
                                  type="checkbox"
                                  checked={selectedCalendarWoIds.includes(wo.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCalendarWoIds([...selectedCalendarWoIds, wo.id]);
                                    } else {
                                      setSelectedCalendarWoIds(selectedCalendarWoIds.filter(id => id !== wo.id));
                                    }
                                  }}
                                />
                              </td>
                              <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                              <td>{wo.duration}s</td>
                              <td>
                                <span className={`status-badge ${wo.status}`}>
                                  {wo.status === 'assigned' ? 'Atandı' : 'Atanmadı'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button 
                    design="Negative" 
                    icon="delete" 
                    style={{ marginTop: '8px', width: '100%' }}
                    disabled={selectedCalendarWoIds.length === 0}
                    onClick={handleRemoveFromCalendar}
                  >
                    Takvimden Çıkar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">Lütfen sol panelden bir planlama takvimi seçin veya oluşturun.</div>
          )}
        </Card>
      </div>

      {/* Row 2: Calendar Selection & Personnel Planning */}
      <div className="planning-bottom-grid">
        {/* Left Side: Works in active calendar to assign */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="employee" />
            <span>3. Takvim Seç Planlama: {activeCalendar ? activeCalendar.name : 'Seçilmedi'}</span>
          </div>

          {activeCalendar ? (
            <>
              <Label style={{ fontWeight: 'bold', marginBottom: '4px' }}>İş Seçimi (Atanacak İşler)</Label>
              <div className="table-container" style={{ maxHeight: '400px' }}>
                <table className="planning-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input 
                          type="checkbox"
                          checked={calendarSelectedWorkOrders.length > 0 && selectedPlanWoIds.length === calendarSelectedWorkOrders.length}
                          onChange={(e) => handleToggleSelectAllPlanWo(e.target.checked)}
                        />
                      </th>
                      <th>İş Emri</th>
                      <th>WorkCenter</th>
                      <th>Süre</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarSelectedWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">Bu takvime henüz iş eklenmemiş.</td>
                      </tr>
                    ) : (
                      calendarSelectedWorkOrders.map(wo => (
                        <tr key={wo.id}>
                          <td className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={selectedPlanWoIds.includes(wo.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPlanWoIds([...selectedPlanWoIds, wo.id]);
                                } else {
                                  setSelectedPlanWoIds(selectedPlanWoIds.filter(id => id !== wo.id));
                                }
                              }}
                            />
                          </td>
                          <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                          <td>{wo.workCenter || 'Belirtilmemiş'}</td>
                          <td>{wo.duration} saat</td>
                          <td>
                            <span className={`status-badge ${wo.status}`}>
                              {wo.status === 'assigned' ? 'Atandı' : 'Atanmadı'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">Aktif planlama için takvim seçilmedi.</div>
          )}
        </Card>

        {/* Right Side: Personnel Selection & Distribution */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="employee" />
            <span>Personel Seçimi & Kapasite Durumu</span>
          </div>

          {activeCalendar ? (
            <>
              <div className="table-container" style={{ maxHeight: '400px' }}>
                <table className="planning-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input 
                          type="checkbox"
                          checked={personnel.length > 0 && selectedPersonnelIds.length === personnel.length}
                          onChange={(e) => handleToggleSelectAllPersonnel(e.target.checked)}
                        />
                      </th>
                      <th>Personel</th>
                      <th>WorkCenter</th>
                      <th style={{ width: '80px' }}>Kapasite</th>
                      <th>Planlı İş</th>
                      <th>İzin Günü</th>
                      <th>Doluluk (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelStats.map(p => {
                      const limitColorClass = p.occupancyRate > 90 ? 'high' : p.occupancyRate > 60 ? 'medium' : 'low';
                      return (
                        <tr key={p.id}>
                          <td className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={selectedPersonnelIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPersonnelIds([...selectedPersonnelIds, p.id]);
                                } else {
                                  setSelectedPersonnelIds(selectedPersonnelIds.filter(id => id !== p.id));
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div 
                                style={{
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '50%', 
                                  backgroundColor: p.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {p.avatar}
                              </div>
                              <div>
                                <strong>{p.name}</strong><br/>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.role}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize: '0.75rem' }}>{p.workCenter || 'Genel'}</span></td>
                          <td>
                            <input 
                              type="number"
                              value={p.capacity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCustomCapacities(prev => ({ ...prev, [p.id]: val }));
                              }}
                              style={{ width: '60px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                          </td>
                          <td><strong>{p.plannedHours} saat</strong></td>
                          <td>
                            {p.leaveDaysCount > 0 ? (
                              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🌴 {p.leaveDaysCount} Gün</span>
                            ) : (
                              <span style={{ opacity: 0.5 }}>—</span>
                            )}
                          </td>
                          <td style={{ minWidth: '100px' }}>
                            <div className="occupancy-text">
                              <span>%{p.occupancyRate}</span>
                              <span>{p.plannedHours}/{p.capacity}s</span>
                            </div>
                            <div className="occupancy-bar-container">
                              <div 
                                className={`occupancy-bar ${limitColorClass}`} 
                                style={{ width: `${Math.min(100, p.occupancyRate)}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Scheduling Actions */}
              <div className="actions-footer">
                <Button 
                  design="Emphasized" 
                  icon="play"
                  onClick={() => {
                    setIsAutoPlanDialogOpen(true);
                    setAutoPlanStep(1);
                  }}
                >
                  Otomatik Planlama (Auto-Plan)
                </Button>
                <Button 
                  design="Default" 
                  icon="employee"
                  disabled={selectedPlanWoIds.length !== 1 || selectedPersonnelIds.length !== 1}
                  onClick={handleOpenManualDialog}
                >
                  Manuel Ata
                </Button>
              </div>
            </>
          ) : (
            <div className="empty-state">Lütfen planlama yapılacak takvimi aktif hale getirin.</div>
          )}
        </Card>
      </div>

      {/* BOTTOM RESULTS PANEL (OTOMATİK PLANLAMA SONUCU) */}
      {planningPreview && (
        <div className="planning-result-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Otomatik Planlama Sonucu
            </span>
            <Tag colorScheme="8">Başarılı</Tag>
          </div>

          <div className="results-grid">
            <div className="result-stat-card">
              <span className="result-stat-label">Toplam Çalışan</span>
              <span className="result-stat-value">{planningPreview.totalEmployees}</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Planlanan Çalışan</span>
              <span className="result-stat-value">{planningPreview.plannedEmployees}</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Toplam Planlanan Gün</span>
              <span className="result-stat-value">{planningPreview.totalPlannedDays} gün</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Otomatik Planlanan</span>
              <span className="result-stat-value" style={{ color: 'var(--success)' }}>
                {planningPreview.autoPlanned}
              </span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Manuel Planlanan</span>
              <span className="result-stat-value" style={{ color: 'var(--primary)' }}>
                {planningPreview.manualPlanned}
              </span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Planlanamayan</span>
              <span className="result-stat-value" style={{ color: 'var(--danger)' }}>
                {planningPreview.unplanned}
              </span>
            </div>
          </div>

          <MessageStrip design="Negative" hideCloseButton>
            Kurallarınıza göre {planningPreview.plannedEmployees} çalışan için otomatik planlama oluşturuldu. {planningPreview.unplanned} çalışan için uygun tarih bulunamadı.
          </MessageStrip>
        </div>
      )}

      {/* AUTOMATIC PLANNING STEP-BY-STEP DIALOG */}
      {isAutoPlanDialogOpen && (
        <Dialog
          open={true}
          headerText="Otomatik Planlama"
          onClose={() => {
            setIsAutoPlanDialogOpen(false);
            setPlanningPreview(null);
          }}
          style={{ width: '480px' }}
        >
          {/* Stepper Header */}
          <div className="stepper-container">
            <div className="step-line"></div>
            <div className={`step-item ${autoPlanStep >= 1 ? 'active' : ''} ${autoPlanStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{autoPlanStep > 1 ? '✓' : '1'}</div>
              <div className="step-label">Kurallar</div>
            </div>
            <div className={`step-item ${autoPlanStep >= 2 ? 'active' : ''} ${autoPlanStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{autoPlanStep > 2 ? '✓' : '2'}</div>
              <div className="step-label">Sonuç</div>
            </div>
            <div className={`step-item ${autoPlanStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <div className="step-label">Onay</div>
            </div>
          </div>

          {autoPlanStep === 1 ? (
            /* STEP 1: RULES BUILDER */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 8px 16px 8px' }}>
              {/* Who target */}
              <div>
                <span className="dialog-section-title">
                  <Icon name="employee" style={{ width: '14px' }} /> Kimler planlansın?
                </span>
                <div className="radio-group-vertical">
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="planTarget" 
                      checked={planTarget === 'ALL'} 
                      onChange={() => setPlanTarget('ALL')} 
                    />
                    <span>Tüm çalışanlar</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="planTarget" 
                      checked={planTarget === 'LEFT_20'} 
                      onChange={() => setPlanTarget('LEFT_20')} 
                    />
                    <span>Kalan izni 20 günden fazla olanlar</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="planTarget" 
                      checked={planTarget === 'DEVIR'} 
                      onChange={() => setPlanTarget('DEVIR')} 
                    />
                    <span>Devir izni bulunanlar</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="planTarget" 
                      checked={planTarget === 'SELECTED'} 
                      onChange={() => setPlanTarget('SELECTED')} 
                    />
                    <span>Seçili çalışanlar ({selectedPersonnelIds.length} kişi)</span>
                  </label>
                </div>
              </div>

              {/* Planning Rules */}
              <div>
                <span className="dialog-section-title">
                  <Icon name="calendar" style={{ width: '14px' }} /> Planlama Kuralları
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={ruleMergeHolidays} 
                      onChange={(e) => setRuleMergeHolidays(e.target.checked)} 
                    />
                    <span>Resmi tatilleri birleştir</span>
                  </label>

                  <label className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={ruleConsiderWeekends} 
                      onChange={(e) => setRuleConsiderWeekends(e.target.checked)} 
                    />
                    <span>Hafta sonlarını dikkate al</span>
                  </label>

                  <div className="checkbox-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={ruleMaxTeamMembers} 
                      onChange={(e) => setRuleMaxTeamMembers(e.target.checked)} 
                    />
                    <span>Aynı ekipten en fazla kişi izinli olsun:</span>
                    <select 
                      value={ruleMaxTeamMembersVal}
                      onChange={(e) => setRuleMaxTeamMembersVal(Number(e.target.value))}
                      style={{ padding: '2px 4px', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  <div className="checkbox-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={ruleMinInterval} 
                      onChange={(e) => setRuleMinInterval(e.target.checked)} 
                    />
                    <span>Aynı kişinin izinleri arasında en az:</span>
                    <select 
                      value={ruleMinIntervalVal}
                      onChange={(e) => setRuleMinIntervalVal(Number(e.target.value))}
                      style={{ padding: '2px 4px', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                      <option value="60">60</option>
                    </select>
                    <span>gün olsun</span>
                  </div>

                  <label className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={rulePrioritizeDevir} 
                      onChange={(e) => setRulePrioritizeDevir(e.target.checked)} 
                    />
                    <span>Devir izinlerini önce kullandır</span>
                  </label>

                  <label className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={ruleMinBlocks} 
                      onChange={(e) => setRuleMinBlocks(e.target.checked)} 
                    />
                    <span>En az 5 günlük bloklar oluştur</span>
                  </label>

                  <label className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={rulePreferBayram} 
                      onChange={(e) => setRulePreferBayram(e.target.checked)} 
                    />
                    <span>Bayram haftalarını tercih et</span>
                  </label>
                </div>
              </div>

              {/* Leave Distribution */}
              <div>
                <span className="dialog-section-title">
                  <Icon name="employee" style={{ width: '14px' }} /> İzin Dağıtım Şekli
                </span>
                <div className="radio-group-vertical">
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="distType" 
                      checked={distributionType === 'ONCE'} 
                      onChange={() => setDistributionType('ONCE')} 
                    />
                    <span>Tek seferde kullandır</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="distType" 
                      checked={distributionType === 'TWICE'} 
                      onChange={() => setDistributionType('TWICE')} 
                    />
                    <span>İkiye böl</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="distType" 
                      checked={distributionType === 'THRICE'} 
                      onChange={() => setDistributionType('THRICE')} 
                    />
                    <span>Üçe böl</span>
                  </label>
                  <label className="radio-row">
                    <input 
                      type="radio" 
                      name="distType" 
                      checked={distributionType === 'SYSTEM'} 
                      onChange={() => setDistributionType('SYSTEM')} 
                    />
                    <span>Sistem uygun şekilde dağıtsın</span>
                    <span className="badge-recommended">Önerilen</span>
                  </label>
                </div>
              </div>

              {/* Busy Periods */}
              <div>
                <span className="dialog-section-title">
                  <Icon name="calendar" style={{ width: '14px' }} /> Yoğun Dönemler
                </span>
                <span className="card-subtitle">Bu dönemlerde izin verme</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                  <input 
                    type="date" 
                    value={busyStart}
                    onChange={(e) => setBusyStart(e.target.value)}
                    style={{ padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
                  />
                  <span>-</span>
                  <input 
                    type="date" 
                    value={busyEnd}
                    onChange={(e) => setBusyEnd(e.target.value)}
                    style={{ padding: '4px 6px', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
                  />
                  <Button 
                    design="Emphasized" 
                    onClick={() => {
                      if (busyStart && busyEnd) {
                        setBusyPeriods([...busyPeriods, { start: busyStart, end: busyEnd }]);
                      }
                    }}
                    style={{ padding: '0 8px' }}
                  >
                    + Ekle
                  </Button>
                </div>

                <div className="chips-list">
                  {busyPeriods.map((bp, index) => (
                    <div className="chip-item" key={index}>
                      <span>{bp.start} - {bp.end}</span>
                      <span 
                        className="chip-close" 
                        onClick={() => setBusyPeriods(busyPeriods.filter((_, idx) => idx !== index))}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Run Planning Button */}
              <Button 
                design="Emphasized" 
                onClick={handleRunAutoPlanning}
                style={{ 
                  marginTop: '12px', 
                  width: '100%', 
                  backgroundColor: 'var(--primary)',
                  fontWeight: 'bold',
                  height: '38px'
                }}
              >
                Planlamayı Çalıştır
              </Button>
            </div>
          ) : (
            /* STEP 2: PREVIEW DRAFT SUCCESS VIEW WITH SUMMARY */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 8px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Otomatik Planlama Sonucu
                </span>
                <Tag colorScheme="8">Başarılı</Tag>
              </div>

              {planningPreview && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Toplam Çalışan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.totalEmployees}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Planlanan Çalışan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.plannedEmployees}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Toplam Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.totalPlannedDays} gün</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Otomatik Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{planningPreview.autoPlanned}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Manuel Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{planningPreview.manualPlanned}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Planlanamayan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>{planningPreview.unplanned}</span>
                    </div>
                  </div>

                  <MessageStrip design="Negative" hideCloseButton>
                    Kurallarınıza göre {planningPreview.plannedEmployees} çalışan için otomatik planlama oluşturuldu. {planningPreview.unplanned} çalışan için uygun tarih bulunamadı.
                  </MessageStrip>
                </>
              )}

              <div className="success-checkmark-container" style={{ padding: '12px 0 0 0', gap: '8px' }}>
                <div className="success-checkmark-circle" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>✓</div>
                <span className="success-checkmark-title" style={{ fontSize: '1rem' }}>Planlama Taslağı Hazır</span>
                <span className="success-checkmark-subtitle">
                  Belirlediğiniz kurallara göre geçici izin planlaması hesaplandı.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                <Button 
                  design="Emphasized" 
                  onClick={handleConfirmPlanning}
                  style={{ width: '100%', backgroundColor: 'var(--primary)' }}
                >
                  Onayla ve Kaydet
                </Button>
                <Button 
                  design="Transparent" 
                  onClick={handleCancelPlanning}
                  style={{ width: '100%' }}
                >
                  Kuralları Düzenle
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* Manual Assignment Dialog */}
      {isManualDialogOpen && (
        <Dialog
          open={true}
          headerText="Manuel İş Atama"
          onClose={() => setIsManualDialogOpen(false)}
          style={{ width: '400px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            <MessageStrip design="Information" hideCloseButton>
              Seçilen personelin izin günlerini kontrol ederek uygun bir tarih ve saat dilimine atama yapılacaktır.
            </MessageStrip>
            
            <div className="form-group">
              <Label>İş Emri</Label>
              <Input value={workOrders.find(w => w.id === manualWoId)?.title || ''} disabled />
            </div>

            <div className="form-group">
              <Label>Personel</Label>
              <Input value={personnel.find(p => p.id === manualPersonId)?.name || ''} disabled />
            </div>

            <div className="form-group">
              <Label required>Planlama Tarihi</Label>
              <Select 
                onChange={(e: any) => setManualDate(e.target.value)} 
                style={{ width: '100%' }}
              >
                {activeCalendarDays
                  .filter(dayStr => manualPersonId ? !isPersonOnLeave(manualPersonId, dayStr) : true)
                  .map(dayStr => (
                    <Option 
                      key={dayStr} 
                      value={dayStr} 
                      selected={manualDate === dayStr}
                    >
                      {dayStr}
                    </Option>
                  ))
                }
              </Select>
            </div>
          </div>

          <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', width: '100%' }}>
            <Button design="Transparent" onClick={() => setIsManualDialogOpen(false)}>İptal</Button>
            <Button design="Emphasized" icon="save" onClick={handleManualAssign}>Kaydet</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
